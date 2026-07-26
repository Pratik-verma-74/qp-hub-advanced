const crypto = require('crypto');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
    'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY || 'private_85hQSssNIIYM4n1m1KntTxe6eUs=';
  
  if (!IMAGEKIT_PRIVATE_KEY) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Server configuration error: Missing secrets." })
    };
  }

  try {
    const token = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
    const expire = Math.floor(Date.now() / 1000) + 2400; // 40 minutes
    const signature = crypto.createHmac('sha1', IMAGEKIT_PRIVATE_KEY)
                            .update(token + expire)
                            .digest('hex');
                            
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ token, expire, signature })
    };
  } catch (error) {
    console.error("Error generating ImageKit auth:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to generate authentication parameters" })
    };
  }
};
