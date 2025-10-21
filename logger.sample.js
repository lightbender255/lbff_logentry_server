// Sample usage of logger.js for Minecraft addon development
const { log, stringifyError } = require('./logger');

// Log an info message
log('info', 'This is a test log entry from the addon.');

// Log an error
try {
  throw new Error('Sample error for logger');
} catch (err) {
  log('error', 'An error occurred', stringifyError(err));
}
