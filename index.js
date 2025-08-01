const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 8080;

// ✅ CORS setup
app.use(cors({
  origin: 'https://www.getveloce.com',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));
app.options('*', cors());

// ✅ Body parser
app.use(bodyParser.json());

// ✅ API endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const apiKey = process.env.OPENAI_API_KEY;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }],
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        }
      }
    );

    const reply = response.data.choices[0].message.content.trim();
    res.json({ reply });

  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ reply: "Sorry, something went wrong on our end." });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
