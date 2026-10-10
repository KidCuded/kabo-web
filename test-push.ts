// test-push.ts
import { sendAppleWalletPush } from './utils/applePush';

// Optional: If your env variables are in a .env file, you might need to load them here
// import 'dotenv/config'; 

async function runTest() {
  // Use the 64-character token you grabbed earlier
  const testToken = 'f66aacbabf9e25b9c059f5e9f0bb4cdc0c07e691e19c85242e9ac8fe1a36919c';
  
  console.log('🚀 Initiating Apple Wallet Push Test...');
  console.log(`Token: ${testToken}`);
  
  await sendAppleWalletPush(testToken);
  
  console.log('🏁 Test script finished.');
}

runTest();