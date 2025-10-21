const request = require('supertest');
const fs = require('fs');
const path = require('path');
const express = require('express');

// Import the server logic
const LOG_FILE = path.join(__dirname, 'logs', 'test.log');
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

// --- logger.js tests ---
describe('Logger Utility', () => {
  const logger = require('./logger');

  it('stringifyError handles Error objects', () => {
    const err = new Error('fail');
    const str = logger.stringifyError(err);
    expect(str).toContain('Error: fail');
    expect(str).toContain('at');
  });

  it('stringifyError handles objects', () => {
    const obj = { foo: 'bar' };
    const str = logger.stringifyError(obj);
    expect(str).toBe(JSON.stringify(obj));
  });

  it('stringifyError handles primitives', () => {
    expect(logger.stringifyError(42)).toBe('42');
    expect(logger.stringifyError('abc')).toBe('abc');
  });
});

// --- logger.sample.js tests ---
describe('Logger Sample Usage', () => {
  it('should not throw when running logger.sample.js', () => {
    expect(() => require('./logger.sample')).not.toThrow();
  });
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
