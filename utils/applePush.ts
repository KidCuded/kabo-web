// utils/applePush.ts
import jwt from 'jsonwebtoken'

export async function sendAppleWalletPush(pushToken: string) {
  try {
    const teamId = process.env.APPLE_TEAM_ID!
    const keyId = process.env.APPLE_APNS_KEY_ID!
    // Clean the private key 
    const privateKey = process.env.APPLE_APNS_KEY!.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n').trim()

    // 1. Generate the Apple Authorization Token
    const token = jwt.sign(
      { iss: teamId, iat: Math.floor(Date.now() / 1000) },
      privateKey,
      { algorithm: 'ES256', header: { alg: 'ES256', kid: keyId } }
    )

    // 2. Send the Push Notification via HTTP/2
    // Production passes must go to api.push.apple.com
    const response = await fetch(`https://api.push.apple.com/3/device/${pushToken}`, {
      method: 'POST',
      headers: {
        'authorization': `bearer ${token}`,
        'apns-topic': 'pass.my.kabo', // Pass Type ID
      },
      // Apple Wallet updates specifically require an empty JSON body
      body: JSON.stringify({}) 
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`APNs Push Failed for token ${pushToken}:`, errorText)
    }
  } catch (error) {
    console.error('Error generating APNs token:', error)
  }
}