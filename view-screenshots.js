import fs from 'fs';
import path from 'path';

function getImageInfo(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const sizeInKB = Math.round(stats.size / 1024);
    return {
      exists: true,
      size: `${sizeInKB} KB`,
      modified: stats.mtime.toLocaleString()
    };
  } catch (error) {
    return { exists: false };
  }
}

console.log('📱 World Referral System Screenshots\n');
console.log('=' .repeat(50));

const screenshots = [
  {
    name: 'Home Page (Full)',
    file: 'home-page.png',
    description: 'Complete home page with logo, features, and content'
  },
  {
    name: 'Register Page',
    file: 'register-page.png', 
    description: 'User registration/login page'
  },
  {
    name: 'Mobile View',
    file: 'mobile-home.png',
    description: 'Mobile responsive view (375x667)'
  },
  {
    name: 'Desktop Wide',
    file: 'desktop-wide.png',
    description: 'Desktop view (1920x1080)'
  }
];

screenshots.forEach(screenshot => {
  const filePath = path.join('screenshots', screenshot.file);
  const info = getImageInfo(filePath);
  
  console.log(`\n📸 ${screenshot.name}`);
  console.log(`   File: ${screenshot.file}`);
  console.log(`   Description: ${screenshot.description}`);
  
  if (info.exists) {
    console.log(`   ✅ Status: Available`);
    console.log(`   📊 Size: ${info.size}`);
    console.log(`   ⏰ Created: ${info.modified}`);
  } else {
    console.log(`   ❌ Status: Not found`);
  }
});

console.log('\n' + '=' .repeat(50));
console.log('🎯 All screenshots are saved in the screenshots/ directory');
console.log('💡 You can open them with any image viewer or browser');