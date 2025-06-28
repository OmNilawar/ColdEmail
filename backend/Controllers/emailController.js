import { google } from 'googleapis';
import User from '../Models/userModel.js';
import Email from '../Models/emailModel.js';
import EmailStatus from '../Models/emailStatusModel.js';

export const sendEmail = async (req, res) => {
  try {
    const { recipients, subject, body } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Unauthorized: No user info' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const oAuth2Client = new google.auth.OAuth2(
      process.env.Client_ID,
      process.env.Client_Secret,
      process.env.GOOGLE_CALLBACK_URL
    );

    console.log(req.user);

    oAuth2Client.setCredentials({ refresh_token: user.refreshToken });

    try {
      await oAuth2Client.getAccessToken();
    } catch (err) {
      console.error('Access token fetch failed:', err.message);
      return res.status(401).json({
        message: 'Google session expired. Please reconnect your account.',
      });
    }

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const emailDoc = await Email.create({ subject, body });
    const results = [];

    for (let to of recipients) {
      const emailLines = [
        `To: ${to}`,
        `Subject: ${subject}`,
        'Content-Type: text/html; charset=utf-8',
        '',
        body,
      ];

      const rawEmail = emailLines.join('\n');
      const encodedEmail = Buffer.from(rawEmail)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const gmailResponse = await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: encodedEmail },
      });

      const statusDoc = await EmailStatus.create({
        user: user._id,
        email: emailDoc._id,
        recipient: to,
        messageId: gmailResponse.data.id,
        threadId: gmailResponse.data.threadId,
        status: 'sent',
      });

      results.push({
        recipient: to,
        messageId: gmailResponse.data.id,
        threadId: gmailResponse.data.threadId,
      });
    }

    res.status(200).json({
      message: 'Emails sent successfully!',
      count: recipients.length,
      results,
    });
  } catch (error) {
    console.error('Error sending email:', error.message);
    res.status(500).json({ message: 'Failed to send emails', error: error.message });
  }
};

export const checkReplies = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Unauthorized: No user info' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const oAuth2Client = new google.auth.OAuth2(
      process.env.Client_ID,
      process.env.Client_Secret,
      process.env.GOOGLE_CALLBACK_URL
    );

    oAuth2Client.setCredentials({ refresh_token: user.refreshToken });

    try {
      await oAuth2Client.getAccessToken();
    } catch (err) {
      console.error('Access token fetch failed:', err.message);
      return res.status(401).json({
        message: 'Google session expired. Please reconnect your account.',
      });
    }

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const pendingEmails = await EmailStatus.find({
      user: user._id,
      status: 'sent',
    });

    const updatedReplies = [];

    for (let emailStatus of pendingEmails) {
      const thread = await gmail.users.threads.get({
        userId: 'me',
        id: emailStatus.threadId,
      });

      const messages = thread.data.messages;
      if (messages.length <= 1) continue;

      const latest = messages[messages.length - 1];

      const fromHeader = latest.payload.headers.find(
        (header) => header.name.toLowerCase() === 'from'
      );
      const from = fromHeader?.value?.toLowerCase() || '';

      const isAutoReply =
        from.includes('mailer-daemon') ||
        from.includes('postmaster') ||
        from.includes('no-reply') ||
        latest.payload.headers.some(
          (header) =>
            header.name.toLowerCase() === 'auto-submitted' &&
            header.value.toLowerCase() === 'auto-replied'
        );

      const isFromUser = from.includes(user.email.toLowerCase());

      if (isAutoReply) {
        emailStatus.status = 'failed';
        emailStatus.replyAt = new Date();
      } else if (!isFromUser) {
        emailStatus.status = 'replied';
        emailStatus.replyAt = new Date();
      }

      if (emailStatus.isModified('status')) {
        await emailStatus.save();
        updatedReplies.push({
          recipient: emailStatus.recipient,
          threadId: emailStatus.threadId,
          newStatus: emailStatus.status,
          updatedAt: emailStatus.replyAt,
        });
      }
    }

    res.status(200).json({
      message: 'Reply check complete',
      updated: updatedReplies.length,
      repliedEmails: updatedReplies,
    });
  } catch (error) {
    console.error('Error checking replies:', error.message);
    res.status(500).json({
      message: 'Failed to check replies',
      error: error.message,
    });
  }
};

export const updateEmailStatus = async (req, res) => {
  try {
    const { newStatus } = req.body;
    const { id: emailStatusId } = req.params;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Unauthorized: User not logged in' });
    }

    const validStatuses = ['sent', 'delivered', 'opened', 'replied', 'failed'];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const emailStatus = await EmailStatus.findById(emailStatusId);
    if (!emailStatus) {
      return res.status(404).json({ message: 'Email status entry not found' });
    }

    if (emailStatus.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: Not allowed to update this entry' });
    }

    emailStatus.status = newStatus;
    if (newStatus === 'replied' || newStatus === 'failed') {
      emailStatus.replyAt = new Date();
    }

    await emailStatus.save();

    res.status(200).json({
      message: `Status updated to '${newStatus}'`,
      updated: emailStatus,
    });
  } catch (error) {
    console.error('Error updating email status:', error.message);
    res.status(500).json({ message: 'Failed to update email status', error: error.message });
  }
};