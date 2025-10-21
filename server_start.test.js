const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'logs', 'test.log');
const SERVER_PATH = path.join(__dirname, 'server.js');

describe('Server Start Log Entry', () => {
  let serverProcess;
  beforeAll(async () => {
    if (fs.existsSync(LOG_FILE)) fs.unlinkSync(LOG_FILE);
    serverProcess = spawn(process.execPath, [SERVER_PATH], {
      env: { ...process.env, PORT: '3998', LOG_FILE: LOG_FILE },
      stdio: 'inherit'
    });
    // Wait for the server to start
    await new Promise((resolve) => setTimeout(resolve, 800));
  }, 10000);

  afterAll(() => {
  if (serverProcess) serverProcess.kill();
  // if (fs.existsSync(LOG_FILE)) fs.unlinkSync(LOG_FILE); // Commented out for debug
  });

  it('should write a server start entry to the log file', async () => {
    const expectedPattern = /\[SERVER_START\] \{.*"timestamp":".*","message":"Log Entry Server started on port 3998"\}/;
    let content = '';
    const start = Date.now();
    while (Date.now() - start < 2000) {
      content = fs.existsSync(LOG_FILE) ? fs.readFileSync(LOG_FILE, 'utf8') : '';
      if (expectedPattern.test(content)) break;
      await new Promise(r => setTimeout(r, 100));
    }
    expect(content).toMatch(expectedPattern);
  });
});
