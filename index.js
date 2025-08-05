const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
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

let chatFlow;
try {
  const flowPath = path.join(__dirname, 'data', 'aria-flow.json');
  const flowData = fs.readFileSync(flowPath, 'utf8');
  chatFlow = JSON.parse(flowData);
} catch (error) {
  console.error('Failed to load aria-flow.json:', error.message);
  process.exit(1);
}

const sessions = {}; // Tracks session state in memory

app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ reply: 'Missing session ID.' });
    }

    if (!sessions[sessionId]) {
      sessions[sessionId] = { step: 0, data: {} };
    }

    const session = sessions[sessionId];
    const currentStep = chatFlow.steps[session.step];

    // Store user response for the current step
    if (currentStep && currentStep.key) {
      session.data[currentStep.key] = message;
    }

    session.step += 1;
    const nextStep = chatFlow.steps[session.step];

    if (nextStep) {
      return res.json({ reply: nextStep.prompt });
    } else {
      return res.json({ reply: "Thank you. Someone from our team will be in touch shortly." });
    }

  } catch (error) {
    console.error('Chat error:', error.message);
    return res.status(500).json({
      reply: "Sorry, as mentioned I’m still in training phase. Could I please get someone to ring you or email with the right answer as I do not want to mislead you."
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
