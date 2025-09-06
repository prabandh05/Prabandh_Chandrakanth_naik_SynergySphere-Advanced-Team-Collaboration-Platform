const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

const envContent = `# Supabase Configuration
# Replace these with your actual Supabase project credentials
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
`;

const envExampleContent = `# Supabase Configuration
# Copy this file to .env and replace with your actual Supabase project credentials
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
`;

// Create .env.example if it doesn't exist
if (!fs.existsSync(envExamplePath)) {
  fs.writeFileSync(envExamplePath, envExampleContent);
  console.log('✅ Created .env.example file');
}

// Create .env if it doesn't exist
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file');
  console.log('⚠️  Please update .env with your actual Supabase credentials');
  console.log('📖 See SETUP_DATABASE.md for detailed instructions');
} else {
  console.log('ℹ️  .env file already exists');
}

console.log('\n🔧 Next steps:');
console.log('1. Get your Supabase credentials from https://supabase.com');
console.log('2. Update the .env file with your actual credentials');
console.log('3. Set up the database tables (see SETUP_DATABASE.md)');
console.log('4. Restart your development server');
