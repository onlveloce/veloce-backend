const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
  origin: 'https://www.getveloce.com',
  methods: ['POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());

// Load Aria's pre-defined Q&A flow
const ariaFlow = JSON.parse(fs.readFileSync(path.join(__dirname, 'aria-flow.json'), 'utf8'));

// Main chat endpoint
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  const lowerCaseMsg = message.toLowerCase();

  // Check for a predefined response
  const matchedEntry = ariaFlow.find(entry => 
    entry.q.some(q => lowerCaseMsg.includes(q.toLowerCase()))
  );

  if (matchedEntry) {
    return res.json({ reply: matchedEntry.a });
  }

  // If no match found, respond politely that Aria is still learning
  return res.json({ reply: "Sorry, as mentioned I’m still in training phase. Could I please get someone to ring you or email with the right answer as I do not want to mislead you." });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
