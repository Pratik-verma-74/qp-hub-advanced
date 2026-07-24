const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8081;

// Middlewares
app.use(cors());
app.use(express.json());

// Serve static frontend files (index.html, css, js, etc.)
app.use(express.static(path.join(__dirname)));

// ---------------------------------------------------------
// IMAGEKIT SECURE AUTHENTICATION ENDPOINT
// ---------------------------------------------------------
// Keep this key secret on the server. DO NOT expose it to the client!
const IMAGEKIT_PRIVATE_KEY = 'private_85hQSssNIIYM4n1m1KntTxe6eUs=';

app.get('/api/imagekit/auth', (req, res) => {
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
});

// Start the server
app.listen(PORT, () => {
  console.log(`\n==============================================`);
  console.log(`🚀 Academic Hub Server is running!`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`🔒 Secure ImageKit Backend Active`);
  console.log(`==============================================\n`);
});
