const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

console.log("⏳ Starting Aria backend...");

let chatFlow;

try {
  const flowPath = path.join(__dirname, 'data', 'aria-flow.json');
  console.log("📁 Loading file from:", flowPath);

  const flowData = fs.readFileSync(flowPath, 'utf8');
  chatFlow = JSON.parse(flowData);

  console.log("✅ Loaded Aria conversation flow successfully");
} catch (error) {
  console.error('❌ Failed to load aria-flow.json:', error.message);
  process.exit(1);
}

// Helper function to find the best match
function getBotResponse(userMessage) {
  const cleaned = userMessage.toLowerCase();
  const match = chatFlow.find(entry =>
    entry.question.toLowerCase().includes(cleaned)
  );

  if (match) return match.answer;

  return "Sorry, as mentioned I’m still in training phase. Could I please get someone to ring you or email with the right answer as I do not want to mislead you.";
}

// POST /chat route
app.post('/chat', (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: "Missing 'message' in request body" });
  }

  const botReply = getBotResponse(userMessage);
  res.json({ message: botReply });
});

// Root route (optional for Render testing)
app.get('/', (req, res) => {
  res.send('✅ Aria backend is running.');
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
