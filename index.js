const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 8080;

// Updated path to match /data folder
const flow = JSON.parse(fs.readFileSync('./data/aria-flow.json', 'utf8'));

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Veloce backend is running.');
});

app.post('/api/chat', (req, res) => {
  const { message, stepId } = req.body;

  if (!stepId || !flow[stepId]) {
    return res.status(400).json({
      reply: "Sorry, I'm still in training phase. Could I please get someone to ring you or email with the right answer as I do not want to mislead you.",
      nextStepId: 'default',
    });
  }

  const step = flow[stepId];
  const nextStepId = step.next || 'default';

  const replyWithName = step.reply.replace('{{name}}', message || '');

  return res.json({
    reply: replyWithName,
    nextStepId,
  });
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
