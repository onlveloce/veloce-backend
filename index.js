const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const cheerio = require('cheerio'); // for lightweight HTML scraping

const app = express();
const PORT = process.env.PORT || 8080;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Enable CORS for any origin (for Render deployment)
app.use(cors());

app.use(bodyParser.json());

app.post('/api/chat', async (req, res) => {
  try {
    const { message, domain } = req.body;
    console.log(`🔹 Message from ${domain}: ${message}`);

    // Optional: scrape content from the domain
    const scrapedContent = await scrapeSiteContent(domain);

    // Format content to send to OpenAI
    const systemPrompt = `You are Aria, a helpful and intelligent assistant for the business website: ${domain}.
Only use the provided content to answer questions. If unsure, say: "Let me get back to you on that.".
Here’s the content from the website:
---
${scrapedContent}
`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.6
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`
        }
      }
    );

    const reply = response.data.choices[0].message.content.trim();
    res.json({ reply });
  } catch (error) {
    console.error('❌ Chat error:', error.message);
    res.status(500).json({ reply: "Sorry, something went wrong on our end." });
  }
});

// Basic scraping function (can be improved later)
async function scrapeSiteContent(domain) {
  try {
    const url = `https://${domain}`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Get all paragraph text
    const text = $('p').map((i, el) => $(el).text()).get().join('\n');
    return text.slice(0, 4000); // Limit for OpenAI input
  } catch (err) {
    console.error(`❌ Scraping failed for ${domain}:`, err.message);
    return "No content could be loaded from the site.";
  }
}

app.listen(PORT, () => {
  console.log(`🚀 Aria backend running on port ${PORT}`);
});
