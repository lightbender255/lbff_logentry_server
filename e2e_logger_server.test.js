const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const LOG_FILE = path.join(__dirname, 'logs', 'e2e_test.log');
const SERVER_PATH = path.join(__dirname, 'server.js');

// Helper to wait for server to be ready
function waitForServer(port, timeout = 3000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const tryConnect = () => {
      require('http').get(`http://localhost:${port}/health`, res => {
        if (res.statusCode === 200) resolve();
        else setTimeout(tryConnect, 100);
      }).on('error', () => {
        if (Date.now() - start > timeout) reject(new Error('Server not ready'));
        else setTimeout(tryConnect, 100);
      });
    };
    tryConnect();
  });
}

describe('End-to-End Logger/Server', () => {
  let serverProcess;
  beforeAll(async () => {
    if (fs.existsSync(LOG_FILE)) fs.unlinkSync(LOG_FILE);
    serverProcess = spawn(process.execPath, [SERVER_PATH], {
      env: { ...process.env, PORT: '3997', LOG_FILE: LOG_FILE },
      stdio: 'ignore'
    });
    await waitForServer(3997);
  }, 10000);

  afterAll(() => {
    if (serverProcess) serverProcess.kill();
    if (fs.existsSync(LOG_FILE)) fs.unlinkSync(LOG_FILE);
  });

  it('logger writes to server and file', done => {
  process.env.LOG_SERVER_URL = 'http://localhost:3997/log';
    const testMsg = 'E2E test log entry';
    logger.log('info', testMsg);
    setTimeout(() => {
      const content = fs.existsSync(LOG_FILE) ? fs.readFileSync(LOG_FILE, 'utf8') : '';
      expect(content).toContain(testMsg);
      done();
    }, 500);
  });
});
