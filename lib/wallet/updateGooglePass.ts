// lib/wallet/updateGooglePass.ts
import { GoogleAuth } from 'google-auth-library'
import { parseEnv } from '@/lib/parseEnvCredentials'

export async function pushGoogleWalletUpdate(businessId: string, customerId: string, newStamps: number, threshold: number) {
  try {
    const clientEmail = parseEnv(process.env.GOOGLE_CLIENT_EMAIL)
    const privateKey = parseEnv(process.env.GOOGLE_PRIVATE_KEY)
    const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID
    
    // The Object ID matches the customer UUID used during registration
    const objectId = `${issuerId}.${customerId}` 

    const auth = new GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
    })
    
    const client = await auth.getClient()

    // We send a PATCH request to update points, text, and the image URL
    const updatePayload = {
      loyaltyPoints: {
        balance: { string: `${newStamps} of ${threshold}` },
        label: 'STAMPS'
      },
      heroImage: {
        sourceUri: {
          uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/wallet/dynamic-strip?businessId=${businessId}&stamps=${newStamps}&v=${Date.now()}`
        }
      }
    }

    await client.request({
      url: `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/${objectId}`,
      method: 'PATCH',
      data: updatePayload
    })

    console.log(`Successfully pushed Google Wallet update for customer: ${customerId}`)
  } catch (error: any) {
    console.error('Failed to update Google Wallet:', error.message)
  }
}