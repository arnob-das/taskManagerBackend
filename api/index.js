let app;
let initError = null;

try {
  app = require('../index.js');
} catch (err) {
  initError = err;
  console.error('Initialization error in index.js:', err);
}

module.exports = (req, res) => {
  if (initError) {
    return res.status(500).json({
      error: 'Backend Initialization Error',
      message: initError.message,
      stack: initError.stack,
    });
  }
  try {
    return app(req, res);
  } catch (err) {
    return res.status(500).json({
      error: 'Runtime Error in Express App',
      message: err.message,
      stack: err.stack,
    });
  }
};
