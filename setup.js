#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 VidCall Platform Setup\n');

// Check if .env file exists
if (!fs.existsSync('.env')) {
  console.log('📝 Creating .env file from template...');
  if (fs.existsSync('env.example')) {
    fs.copyFileSync('env.example', '.env');
    console.log('✅ .env file created successfully!');
  } else {
    console.log('❌ env.example file not found!');
    process.exit(1);
  }
} else {
  console.log('✅ .env file already exists');
}

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  console.log('📦 Installing backend dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Backend dependencies installed!');
  } catch (error) {
    console.log('❌ Failed to install backend dependencies');
    process.exit(1);
  }
} else {
  console.log('✅ Backend dependencies already installed');
}

// Check if client/node_modules exists
if (!fs.existsSync('client/node_modules')) {
  console.log('📦 Installing frontend dependencies...');
  try {
    execSync('npm install', { cwd: 'client', stdio: 'inherit' });
    console.log('✅ Frontend dependencies installed!');
  } catch (error) {
    console.log('❌ Failed to install frontend dependencies');
    process.exit(1);
  }
} else {
  console.log('✅ Frontend dependencies already installed');
}

// Check if client/build exists
if (!fs.existsSync('client/build')) {
  console.log('🔨 Building frontend for production...');
  try {
    execSync('npm run build', { cwd: 'client', stdio: 'inherit' });
    console.log('✅ Frontend built successfully!');
  } catch (error) {
    console.log('❌ Failed to build frontend');
    process.exit(1);
  }
} else {
  console.log('✅ Frontend already built');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Edit .env file with your Agora.io credentials');
console.log('2. Run "npm start" to start the application');
console.log('3. Open http://localhost:3001 in your browser');
console.log('\n📖 For detailed instructions, see README.md');
