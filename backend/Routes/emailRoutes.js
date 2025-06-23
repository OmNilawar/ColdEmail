import express from 'express';
import { generateEmail } from '../Controllers/generateEmail.js';
import { sendEmail } from '../Controllers/emailController.js';

const emailRouter = express.Router();

// POST /generate-email
emailRouter.post('/generate-email', generateEmail);
emailRouter.post('/send-email',sendEmail);

export default emailRouter;