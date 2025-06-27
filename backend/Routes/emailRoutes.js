import express from 'express';
import { generateEmail } from '../Controllers/generateEmail.js';
import { sendEmail, checkReplies, updateEmailStatus} from '../Controllers/emailController.js';

const emailRouter = express.Router();

// POST /generate-email
emailRouter.post('/generate-email', generateEmail);
emailRouter.post('/send-email',sendEmail);
emailRouter.get('/check-status',checkReplies);
emailRouter.patch('/update-status-manual/:id',updateEmailStatus);

export default emailRouter;