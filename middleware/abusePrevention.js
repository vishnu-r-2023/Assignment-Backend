const cooldown = new Map();

module.exports = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();

  console.log('Abuse prevention check for IP:', ip); // Debugging

  // Reduce cooldown period to 10 seconds for testing
  if (cooldown.has(ip) && now - cooldown.get(ip) < 10000) {
    console.log('Cooldown active for IP:', ip); // Debugging
    return res.status(429).json({ message: 'Please wait before claiming another coupon' });
  }

  cooldown.set(ip, now);
  next();
};
