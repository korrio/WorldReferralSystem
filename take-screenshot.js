import { chromium } from 'playwright';
import fs from 'fs';

async function takeScreenshots() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('Taking screenshots of World Referral System...');
    
    // Set viewport size for consistent screenshots
    await page.setViewportSize({ width: 1200, height: 800 });
    
    const baseUrl = 'http://localhost:8000';
    
    // Take screenshot of home page
    console.log('📸 Capturing home page...');
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: 'screenshots/home-page.png',
      fullPage: true
    });
    console.log('✅ Home page screenshot saved to screenshots/home-page.png');
    
    // Take screenshot of register page
    console.log('📸 Capturing register page...');
    await page.goto(`${baseUrl}/register`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: 'screenshots/register-page.png',
      fullPage: true
    });
    console.log('✅ Register page screenshot saved to screenshots/register-page.png');
    
    // Take mobile viewport screenshot
    console.log('📸 Capturing mobile view...');
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: 'screenshots/mobile-home.png',
      fullPage: true
    });
    console.log('✅ Mobile view screenshot saved to screenshots/mobile-home.png');
    
    // Take desktop wide screenshot
    console.log('📸 Capturing desktop wide view...');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: 'screenshots/desktop-wide.png',
      fullPage: false // Just visible area for desktop
    });
    console.log('✅ Desktop wide screenshot saved to screenshots/desktop-wide.png');
    
    console.log('\n🎉 All screenshots completed successfully!');
    console.log('Screenshots saved in the screenshots/ directory');
    
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

// Create screenshots directory if it doesn't exist
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

takeScreenshots();