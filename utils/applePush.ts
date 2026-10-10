// utils/applePush.ts
import jwt from 'jsonwebtoken'

export async function sendAppleWalletPush(pushToken: string) {
  try {
    const teamId = process.env.APPLE_TEAM_ID!
    const keyId = process.env.APPLE_APNS_KEY_ID!
    const privateKey = process.env.APPLE_APNS_KEY!
    console.log(`🔑 Using Apple Team ID: ${teamId}, Key ID: ${keyId}`)
    // console.log(`🔑 Using Apple APNS Key: ${privateKey}`)

    // Generate JWT for APNs authentication
    const token = jwt.sign(
      { iss: teamId, iat: Math.floor(Date.now() / 1000) },
      privateKey,
      { algorithm: 'ES256', header: { alg: 'ES256', kid: keyId } }
    )

    // Send push notification to APNs
    const response = await fetch(`https://api.push.apple.com/3/device/${pushToken}`, {
      method: 'POST',
      headers: {
        'authorization': `bearer ${token}`,
        'apns-topic': 'pass.my.kabo', // Must match your Pass Type ID exactly
      },
      body: JSON.stringify({}) 
    })

    // Log the response for debugging
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ APNs Push Failed [Status: ${response.status}]:`, errorText)
      return { success: false, error: errorText }
    }

    console.log(`✅ APNs Push Successful for token: ${pushToken}`)
    return { success: true }
    
  } catch (error) {
    console.error('❌ Error executing APNs push:', error)
    return { success: false, error }
  }
}