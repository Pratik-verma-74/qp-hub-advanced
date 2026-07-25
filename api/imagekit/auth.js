const crypto = require('crypto');

module.exports = (req, res) => {
  // Add CORS headers so frontend can fetch it
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Read private key from Vercel Environment Variables securely
  const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;
  
  if (!IMAGEKIT_PRIVATE_KEY) {
    console.error("Critical Error: IMAGEKIT_PRIVATE_KEY is missing from environment variables.");
    res.status(500).json({ error: "Server configuration error: Missing secrets." });
    return;
  }

  try {
    const token = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
    const expire = Math.floor(Date.now() / 1000) + 2400; // 40 minutes expiration
    const signature = crypto.createHmac('sha1', IMAGEKIT_PRIVATE_KEY)
                            .update(token + expire)
                            .digest('hex');
                            
    res.status(200).json({
      token: token,
      expire: expire,
      signature: signature
    });
  } catch (error) {
    console.error("Error generating ImageKit auth:", error);
    res.status(500).json({ error: "Failed to generate authentication parameters" });
  }
};
