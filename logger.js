const http = require('http');


const DEV_MODE = true; // Set to false in production

function stringifyError(err) {
  if (err instanceof Error) {
    return `${err.name}: ${err.message}\n${err.stack ?? ''}`;
  }
  if (typeof err === 'object' && err !== null) {
    try {
      return JSON.stringify(err);
    } catch (e) {
      return String(err);
    }
  }
  return String(err);
}

function log(level, message, data) {
  if (!DEV_MODE) return;
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level: level.toUpperCase(),
    message,
    ...(typeof data === 'object' && data !== null ? { data } : {})
  };
  const line = `[DEV_LOG] ${JSON.stringify(logEntry)}`;
  sendLogLine(line);
}


function sendLogLine(line) {
  const LOG_SERVER_URL = process.env.LOG_SERVER_URL || 'http://localhost:3000/log';
  const url = new URL(LOG_SERVER_URL);
  const data = JSON.stringify({ line });
  const options = {
    hostname: url.hostname,
    port: url.port || 80,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };
  const req = http.request(options, (res) => {
    // Optionally handle response
  });
  req.on('error', (e) => {
    if (DEV_MODE) console.error('Logger failed to send log:', e);
  });
  req.write(data);
  req.end();
}

module.exports = {
  stringifyError,
  log
};
