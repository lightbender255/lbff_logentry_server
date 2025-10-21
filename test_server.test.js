const request = require('supertest');
const fs = require('fs');
const path = require('path');
const express = require('express');

// Import the server logic
const LOG_FILE = path.join(__dirname, 'test_logentries.log');
let app;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.post('/log', (req, res) => {
    const { line } = req.body;
    if (typeof line !== 'string' || !line.trim()) {
      return res.status(400).json({ error: 'Missing or invalid "line" in request body.' });
    }
    const entry = line.trim() + '\n';
    fs.appendFileSync(LOG_FILE, entry);
    res.status(200).json({ status: 'ok' });
  });
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });
});

afterAll(() => {
  if (fs.existsSync(LOG_FILE)) fs.unlinkSync(LOG_FILE);
});

describe('Log Entry Server', () => {
  it('should respond to health check', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('should write a valid log entry', async () => {
    const line = 'Test log entry';
    const res = await request(app).post('/log').send({ line });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    const content = fs.readFileSync(LOG_FILE, 'utf8');
    expect(content).toContain(line);
  });

  it('should reject missing line', async () => {
    const res = await request(app).post('/log').send({ });
    expect(res.statusCode).toBe(400);
  });

  it('should reject empty line', async () => {
    const res = await request(app).post('/log').send({ line: '   ' });
    expect(res.statusCode).toBe(400);
  });
});
