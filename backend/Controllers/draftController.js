import Draft from '../Models/draftModel.js';

// ✅ Create a new draft
export const createDraft = async (req, res) => {
  console.log("BODY RECEIVED:", req.body); // 🔍 Debug line

  try {
    const {subject, body } = req.body;

    // ✅ Validate required fields
    if (!subject) {
      return res.status(400).json({ error: 'subject required.' });
    }

    const user = req.user._id;

    // ✅ Optional: Body length check
    if (body && body.length > 10000) {
      return res.status(400).json({ error: 'Body exceeds max length of 10000 characters.' });
    }

    const draft = new Draft({ user, subject, body });
    await draft.save();
    res.status(201).json(draft);
  } catch (err) {
    res.status(400).json({ error: err.message, message : "fail"  });
  }
};

// ✅ Get all drafts for a user
export const getDraftsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    const drafts = await Draft.find({ user: userId }).sort({ updatedAt: -1 });
    res.json(drafts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get a single draft by ID (with ownership check)
export const getDraftById = async (req, res) => {
  try {
    const draft = await Draft.findById(req.params.id);
    if (!draft) return res.status(404).json({ error: 'Draft not found' });

    // ✅ Optional ownership check (requires req.user)
    if (draft.user.toString() !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    res.json(draft);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update a draft
export const updateDraft = async (req, res) => {
  try {
    const { subject, body } = req.body;

    if (body && body.length > 10000) {
      return res.status(400).json({ error: 'Body exceeds max length of 10000 characters.' });
    }

    const draft = await Draft.findById(req.params.id);
    if (!draft) return res.status(404).json({ error: 'Draft not found' });

    // ✅ Optional ownership check
    if (draft.user.toString() !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    // Update fields
    if (subject) draft.subject = subject;
    if (body !== undefined) draft.body = body;
    draft.updatedAt = Date.now();

    await draft.save();
    res.json(draft);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Delete a draft
export const deleteDraft = async (req, res) => {
  try {
    const draft = await Draft.findById(req.params.id);
    if (!draft) return res.status(404).json({ error: 'Draft not found' });

    // ✅ Optional ownership check
    if (draft.user.toString() !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    await draft.remove();
    res.json({ message: 'Draft deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
