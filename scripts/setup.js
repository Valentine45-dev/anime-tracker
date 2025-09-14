#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up AniTrack...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env.local file...');
  const envExample = fs.readFileSync(path.join(process.cwd(), 'env.example'), 'utf8');
  fs.writeFileSync(envPath, envExample);
  console.log('✅ .env.local created successfully');
} else {
  console.log('✅ .env.local already exists');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('pnpm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.log('❌ Failed to install dependencies. Please run "pnpm install" manually.');
  process.exit(1);
}

// Generate Prisma client
console.log('\n🔧 Generating Prisma client...');
try {
  execSync('pnpm db:generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated successfully');
} catch (error) {
  console.log('❌ Failed to generate Prisma client. Please run "pnpm db:generate" manually.');
  process.exit(1);
}

// Push database schema
console.log('\n🗄️ Setting up database...');
try {
  execSync('pnpm db:push', { stdio: 'inherit' });
  console.log('✅ Database schema pushed successfully');
} catch (error) {
  console.log('❌ Failed to push database schema. Please run "pnpm db:push" manually.');
  process.exit(1);
}

console.log('\n🎉 Setup completed successfully!');
console.log('\nNext steps:');
console.log('1. Run "pnpm dev" to start the development server');
console.log('2. Open http://localhost:3000 in your browser');
console.log('3. Create an account and start tracking your anime!');
console.log('\nHappy anime tracking! 🎌');
