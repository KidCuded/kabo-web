// test-push.ts
import * as dotenv from 'dotenv';
// Load the environment variables BEFORE importing the push function
dotenv.config({ path: '.env.local' }); // Or just '.env' depending on your file name

import { sendAppleWalletPush } from './utils/applePush';

async function runTest() {
  // Add a quick check to verify the env variables loaded
  if (!process.env.APPLE_APNS_KEY) {
    console.error('❌ Environment variables failed to load! APPLE_APNS_KEY is missing.');
    return;
  }

  const testToken = 'f66aacbabf9e25b9c059f5e9f0bb4cdc0c07e691e19c85242e9ac8fe1a36919c';
  
  console.log('🚀 Initiating Apple Wallet Push Test...');
  await sendAppleWalletPush(testToken);
  console.log('🏁 Test script finished.');
}

runTest();