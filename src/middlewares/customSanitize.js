// Only sanitize req.body for Express 5
const sanitize = (req, res, next) => {
  const sanitizeValue = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;

    if (Array.isArray(obj)) {
      return obj.map(sanitizeValue);
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Remove keys starting with $ or containing .
      if (key.startsWith('$') || key.includes('.')) continue;
      sanitized[key] = sanitizeValue(value);
    }
    return sanitized;
  };

  if (req.body) {
    req.body = sanitizeValue(req.body);
  }

  next();
};

module.exports = sanitize;
