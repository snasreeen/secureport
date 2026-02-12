// Additional security-related middleware helpers

export const securityHeaders = (req, res, next) => {
  // Prevent framing (clickjacking)
  res.setHeader('X-Frame-Options', 'DENY');
  // Basic XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
};

