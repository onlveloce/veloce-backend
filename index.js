const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

let chatFlow;

try {
  const flowPath = path.join(__dirname, 'data', 'aria-flow.json');
  const flowData = fs.readFileSync(flowPath, 'utf8');
  chatFlow = JSON.parse(flowData);
  console.log("✅ Loaded Aria conversation flow successfully");
} catch (error) {
  console.error("❌ Failed to load Aria flow:", error);
  process.exit(1);
}

app.post('/chat', (req, res) => {
  const userMessage = req.body.message.toLowerCase();
  const matched = chatFlow.find(item =>
    item.questions.some(q => userMessage.includes(q.toLowerCase()))
  );

  if (matched) {
    res.json({ message: matched.answer });
  } else {
    res.json({
      message: "Sorry, I'm still in training. Could someone from our team follow up with you?"
    });
  }
});

app.get('/', (req, res) => {
  res.send('Veloce backend is running.');
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
