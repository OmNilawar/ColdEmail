import express from 'express'
import { createDraft, getDraftById, getDraftsByUser, updateDraft, deleteDraft } from '../Controllers/draftController.js';
import { authenticate } from '../Middleware/authMiddleware.js';

const draftRouter = express.Router();
draftRouter.post('/createDraft',authenticate,createDraft);
draftRouter.get('/getDraftByUser/:userId',authenticate, getDraftsByUser);
draftRouter.get('/getDraftById/:id',authenticate, getDraftById);
draftRouter.put('/updateDraft/:id',authenticate, updateDraft);
draftRouter.delete('/deleteDraft/:id',authenticate, deleteDraft);

export default draftRouter;