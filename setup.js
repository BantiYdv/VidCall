const fs = require('fs');
const path = require('path');

console.log('🎥 Agora Video Call App Setup');
console.log('==============================\n');

// Check if .env exists
const envPath = path.join(__dirname, 'backend', '.env');
const envExamplePath = path.join(__dirname, 'backend', 'env.example');

if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists');
  console.log('   If you need to update it, edit backend/.env manually.\n');
} else {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created backend/.env file from env.example');
    console.log('   Please edit backend/.env and add your Agora.io credentials:\n');
  } else {
    console.log('❌ env.example not found');
    process.exit(1);
  }
}

console.log('📋 Required Environment Variables:');
console.log('   APP_ID=your_agora_app_id_here');
console.log('   APP_CERTIFICATE=your_agora_app_certificate_here');
console.log('   PORT=5000 (optional, defaults to 5000)\n');

console.log('🔗 Get Agora.io Credentials:');
console.log('   1. Go to https://www.agora.io/');
console.log('   2. Sign up and create a new project');
console.log('   3. Copy your App ID and App Certificate');
console.log('   4. Add them to backend/.env\n');

console.log('🚀 After setting up .env, run:');
console.log('   npm run install  # Install all dependencies');
console.log('   npm run build    # Build the React app');
console.log('   npm start        # Start the server\n');

console.log('📖 For more help, see README.md');
