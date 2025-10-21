const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const LOG_FILE = process.env.LOG_FILE || path.join(__dirname, 'logentries.log');

app.use(express.json());

// Accepts a line of text and writes it to a file
app.post('/log', (req, res) => {
  const { line } = req.body;
  if (typeof line !== 'string' || !line.trim()) {
    return res.status(400).json({ error: 'Missing or invalid "line" in request body.' });
  }
  const entry = line.trim() + '\n';
  fs.appendFile(LOG_FILE, entry, (err) => {
    if (err) {
      console.error('Failed to write log entry:', err);
      return res.status(500).json({ error: 'Failed to write log entry.' });
    }
    res.status(200).json({ status: 'ok' });
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Log Entry Server listening on port ${PORT}`);
});
