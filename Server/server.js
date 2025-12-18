const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Middleware

app.use(cors({
  origin: "https://shimmering-dango-5a863e.netlify.app",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],allowedHeaders: ["Content-Type", "Authorization"],     
  credentials: true
}));

// VERY IMPORTANT — allow preflight
app.options("*", cors());
app.use(express.json());

// Code explanation endpoint
app.post('/api/explain/code', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ error: 'Code is required' });
    }

    // Call Groq API
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an expert programming tutor who explains code in Hinglish (Hindi-English mix). 

IMPORTANT RULES:
1. Write ALL explanations in Hinglish (mixing Hindi and English naturally)
2. Keep ALL technical terms, code keywords, and variable names in ENGLISH
3. Use Hinglish for explanations, descriptions, and teaching
4. Write in Roman script (not Devanagari)
5. ALWAYS use this structured format:

## 📋 Code Overview
[Brief summary in 2-3 lines about what the code does]

## 🎯 Purpose
[Explain the main purpose and use case]

## 🔍 Line-by-Line Breakdown
[Explain each important line or block with code snippets]

## ⚙️ How It Works
[Step-by-step flow explanation]

## 💡 Key Concepts
[List important programming concepts used]

## ✅ Best Practices
[If applicable, mention good practices or improvements]

## 🚀 Example Usage
[Show how to use this code with examples]

Remember:
- Use markdown formatting (##, **, \`code\`, etc.)
- Add emojis for visual appeal
- Technical terms: English (function, array, loop, variable, etc.)
- Explanations: Hinglish (ye, karta hai, hota hai, etc.)
- Code snippets: Always in English with \`backticks\`
- Use bullet points and numbered lists
- Keep it organized and easy to scan`
        },
        {
          role: 'user',
          content: `Is code ko detail mein explain karo (structured format mein):\n\n${code}`
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 1,
      stream: false
    });

    const explanation = chatCompletion.choices[0]?.message?.content || 'No explanation generated';

    res.json({ 
      success: true,
      output: explanation 
    });

  } catch (error) {
    console.error('Error calling Groq API:', error);
    res.status(500).json({ 
      error: 'Failed to generate explanation',
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});