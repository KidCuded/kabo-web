// utils/applePush.ts
// Pushes requests to Apple Wallet to send a push notification to the device with the given push token.
import jwt from 'jsonwebtoken';
import http2 from 'http2';

export async function sendAppleWalletPush(pushToken: string) {
  return new Promise((resolve) => {
    try {
      const teamId = process.env.APPLE_TEAM_ID!;
      const keyId = process.env.APPLE_APNS_KEY_ID!;
      const privateKey = process.env.APPLE_APNS_KEY!.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n').trim();

      const token = jwt.sign(
        { iss: teamId, iat: Math.floor(Date.now() / 1000) },
        privateKey,
        { algorithm: 'ES256', header: { alg: 'ES256', kid: keyId } }
      );

      // Connect directly to Apple using HTTP/2
      const client = http2.connect('https://api.push.apple.com');

      client.on('error', (err) => {
        console.error('❌ HTTP/2 Client Error:', err);
        resolve({ success: false, error: err });
      });

      const req = client.request({
        ':method': 'POST',
        ':path': `/3/device/${pushToken}`,
        'authorization': `bearer ${token}`,
        'apns-topic': 'pass.my.kabo', // Ensure this matches your Pass Type ID exactly
      });

      req.on('response', (headers) => {
        const status = headers[':status'];
        let responseData = '';

        req.on('data', (chunk) => {
          responseData += chunk;
        });

        req.on('end', () => {
          client.close(); 
          
          if (status !== 200) {
            resolve({ success: false, error: responseData });
          } else {
            resolve({ success: true });
          }
        });
      });

      // Apple Wallet requires an empty JSON body
      req.write(JSON.stringify({})); 
      req.end();

    } catch (error) {
      console.error('❌ Error executing APNs push:', error);
      resolve({ success: false, error });
    }
  });
}