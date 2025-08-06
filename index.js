const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ Enable CORS for your Wix site
app.use(cors({
  origin: 'https://www.getveloce.com',
  methods: ['POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());

// ✅ Load Aria's flow from JSON
let chatFlow;
try {
  const flowPath = path.join(__dirname, 'data', 'aria-flow.json');
  const flowData = fs.readFileSync(flowPath, 'utf8');
  chatFlow = JSON.parse(flowData);
  console.log('✅ Loaded Aria conversation flow successfully');
} catch (error) {
  console.error('❌ Failed to load aria-flow.json:', error.message);
  process.exit(1);
}

// ✅ Simple logic to match user message to predefined flow
function findReply(userMessage) {
  const key = userMessage.toLowerCase();
  if (chatFlow[key]) {
    return chatFlow[key];
  } else {
    return "Sorry, as mentioned I’m still in training phase. Could I please get someone to ring you or email with the right answer as I do not want to mislead you.";
  }
}

// ✅ Chat endpoint
app.post('/api/chat', (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ reply: 'No message received.' });
  }

  const reply = findReply(message);
  res.json({ reply });
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
