import { chromium } from 'playwright';
import fs from 'fs';

async function takeSquareScreenshots() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('Taking 1080x1080px square screenshots for app store...');
    
    // Set square viewport
    await page.setViewportSize({ width: 1080, height: 1080 });
    
    const baseUrl = 'http://localhost:8000';
    
    // Configure screenshot options for smaller file size
    const screenshotOptions = {
      type: 'jpeg',
      quality: 85, // Reduce quality to keep under 500KB
      fullPage: false // Only capture viewport area
    };
    
    // Screenshot 1: Home page top section (hero)
    console.log('📸 Capturing home page hero section...');
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');
    
    // Scroll to top to ensure we capture the hero section
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);
    
    await page.screenshot({
      ...screenshotOptions,
      path: 'screenshots/square-01-hero.jpg'
    });
    console.log('✅ Hero section saved to screenshots/square-01-hero.jpg');
    
    // Screenshot 2: Home page features section
    console.log('📸 Capturing features section...');
    await page.evaluate(() => {
      const featuresSection = document.querySelector('.bg-muted');
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo(0, window.innerHeight * 0.6);
      }
    });
    await page.waitForTimeout(1000);
    
    await page.screenshot({
      ...screenshotOptions,
      path: 'screenshots/square-02-features.jpg'
    });
    console.log('✅ Features section saved to screenshots/square-02-features.jpg');
    
    // Screenshot 3: Register/Login page
    console.log('📸 Capturing register page...');
    await page.goto(`${baseUrl}/register`);
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);
    
    await page.screenshot({
      ...screenshotOptions,
      path: 'screenshots/square-03-register.jpg'
    });
    console.log('✅ Register page saved to screenshots/square-03-register.jpg');
    
    // Screenshot 4: Mobile optimized view of home page
    console.log('📸 Capturing mobile-optimized view...');
    await page.setViewportSize({ width: 1080, height: 1080 });
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');
    
    // Add some CSS to optimize for square format
    await page.addStyleTag({
      content: `
        body { zoom: 1.2; }
        .max-w-md { max-width: 90vw !important; }
        .px-6 { padding-left: 2rem !important; padding-right: 2rem !important; }
        .text-3xl { font-size: 2.5rem !important; }
      `
    });
    
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);
    
    await page.screenshot({
      ...screenshotOptions,
      path: 'screenshots/square-04-mobile-optimized.jpg'
    });
    console.log('✅ Mobile optimized view saved to screenshots/square-04-mobile-optimized.jpg');
    
    // Screenshot 5: App logo focused view
    console.log('📸 Capturing logo-focused view...');
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');
    
    // Zoom in on the logo area
    await page.addStyleTag({
      content: `
        body { zoom: 1.8; }
        .gradient-bg { padding-top: 4rem !important; padding-bottom: 4rem !important; }
        .max-w-md { text-align: center; }
      `
    });
    
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);
    
    await page.screenshot({
      ...screenshotOptions,
      path: 'screenshots/square-05-logo-focus.jpg'
    });
    console.log('✅ Logo-focused view saved to screenshots/square-05-logo-focus.jpg');
    
    console.log('\n🎉 All square screenshots completed!');
    await checkFileSizes();
    
  } catch (error) {
    console.error('❌ Error taking screenshots:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Make sure the server is running on port 8000:');
      console.log('   npm run dev');
    }
  } finally {
    await browser.close();
  }
}

function checkFileSizes() {
  console.log('\n📊 File Size Check:');
  console.log('=' .repeat(40));
  
  const screenshots = [
    'square-01-hero.jpg',
    'square-02-features.jpg', 
    'square-03-register.jpg',
    'square-04-mobile-optimized.jpg',
    'square-05-logo-focus.jpg'
  ];
  
  screenshots.forEach(filename => {
    try {
      const filePath = `screenshots/${filename}`;
      const stats = fs.statSync(filePath);
      const sizeKB = Math.round(stats.size / 1024);
      const status = sizeKB <= 500 ? '✅' : '⚠️';
      
      console.log(`${status} ${filename}: ${sizeKB} KB`);
      
      if (sizeKB > 500) {
        console.log(`   Warning: File exceeds 500KB limit`);
      }
    } catch (error) {
      console.log(`❌ ${filename}: File not found`);
    }
  });
  
  console.log('\n💡 All files are 1080x1080px JPEG format');
  console.log('📱 Perfect for app store and social media use');
}

// Create screenshots directory if it doesn't exist
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

takeSquareScreenshots();