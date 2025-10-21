
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const LOG_DIR = path.join(__dirname, 'logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR);
}
const LOG_FILE = process.env.LOG_FILE || path.join(LOG_DIR, 'bedrock.log');

// Serve dashboard and logs
app.use('/logs', express.static(LOG_DIR));
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

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
  const debugMsg = `[DEBUG] {"timestamp":"${new Date().toISOString()}","message":"LOG_FILE resolved to: ${LOG_FILE}"}`;
  try {
    fs.writeFileSync(LOG_FILE, debugMsg + '\n', { flag: 'a' });
  } catch (err) {
    console.error('Failed to write debug log entry:', err);
  }
  console.log(debugMsg);
  console.log(`[DEBUG] process.cwd() at startup: ${process.cwd()}`);
  console.log(`[DEBUG] __dirname at startup: ${__dirname}`);
  const startMsg = `[SERVER_START] {"timestamp":"${new Date().toISOString()}","message":"Log Entry Server started on port ${PORT}"}`;
  try {
    fs.writeFileSync(LOG_FILE, startMsg + '\n', { flag: 'a' });
  } catch (err) {
    console.error('Failed to write server start log entry:', err);
  }
  console.log(`Log Entry Server listening on port ${PORT}`);
});
