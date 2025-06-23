import axios from 'axios';

/**
 * POST /generate-email
 * Body can be either:
 * { customPrompt: string }
 * OR
 * { purpose: string, tone: string, userInput: string }
 */
export const generateEmail = async (req, res) => {
  const { purpose, tone, customPrompt, userInput } = req.body;

  let prompt;

  // ✅ Case 1: Use customPrompt directly if provided
  if (customPrompt) {
    prompt = customPrompt;

  // ✅ Case 2: Build prompt from userInput + purpose + tone
  } else if (userInput && purpose && tone) {
    prompt = `Write an email for the following purpose: "${purpose}", with a "${tone}" tone. The context is: "${userInput}". Make the email professional and coherent.`;

  // ❌ Case 3: Invalid input
  } else {
    return res.status(400).json({
      message: 'Please provide either a customPrompt or userInput with both purpose and tone.',
    });
  }

  console.log(`📝 Final Prompt: ${prompt}`);

  // 🚀 1. Try Groq API first
  try {
    const groqResponse = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 512,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const generatedEmail = groqResponse.data.choices[0].message.content;
    return res.status(200).json({ email: generatedEmail, provider: 'groq' });

  } catch (groqError) {
    console.error('❌ Groq API failed:', groqError.response?.data || groqError.message);
  }

  // 🧭 2. Fallback to Together.ai if Groq fails
  try {
    const togetherResponse = await axios.post(
      'https://api.together.xyz/v1/chat/completions',
      {
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 512,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const generatedEmail = togetherResponse.data.choices[0].message.content;
    return res.status(200).json({ email: generatedEmail, provider: 'together.ai' });

  } catch (togetherError) {
    console.error('❌ Together.ai API failed:', togetherError.message);
    return res.status(500).json({
      message: 'Failed to generate email from both providers.',
      error: togetherError.message,
    });
  }
};
