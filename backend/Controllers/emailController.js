import { google } from 'googleapis';
import User from '../Models/userModel.js';

export const sendEmail = async (req, res) => {
  try {
    const { to, subject, body } = req.body;

    if (!req.user || !req.user.googleId) {
      return res.status(401).json({ message: 'Unauthorized: No user info' });
    }

    const userId = req.user.googleId;
    const user = await User.findOne({ googleId: userId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Set up OAuth2 client
    const oAuth2Client = new google.auth.OAuth2(
      process.env.Client_ID,
      process.env.Client_Secret,
      process.env.GOOGLE_CALLBACK_URL
    );

    oAuth2Client.setCredentials({
      refresh_token: user.refreshToken,
    });

    // ⚠️ This refreshes access token automatically if expired
    await oAuth2Client.getAccessToken();

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    // Create email content
    const emailLines = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      body,
    ];

    const email = emailLines.join('\n');
    const encodedEmail = Buffer.from(email)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send email
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail,
      },
    });

    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error.message);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
};
