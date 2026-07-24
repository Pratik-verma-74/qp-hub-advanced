const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle the ImageKit authentication API endpoint (for local development)
app.get('/api/imagekit/auth', (req, res) => {
    try {
        const ImageKit = require("imagekit");
        const imagekit = new ImageKit({
            urlEndpoint: "https://ik.imagekit.io/yv21m6s4z",
            publicKey: "public_YMxLOow/wb4b0vlMruhcMDYjCY0=",
            privateKey: "private_85hQSssNIIYM4n1m1KntTxe6eUs="
        });
        const authenticationParameters = imagekit.getAuthenticationParameters();
        res.json(authenticationParameters);
    } catch (error) {
        console.error("ImageKit Auth Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// For any other route, fallback to index.html (SPA routing if needed)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Local development server running on http://localhost:${PORT}`);
});
