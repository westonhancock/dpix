const sharp = require('sharp');
const path = require('path');

// Create a simple menu bar icon
// 22x22px black icon with transparency
async function createIcon() {
  const svg = `
    <svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="16" height="16" rx="2" fill="none" stroke="black" stroke-width="2"/>
      <path d="M 7 14 L 11 10 L 15 14" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(__dirname, 'assets', 'iconTemplate.png'));

  console.log('Icon created successfully');
}

createIcon().catch(console.error);
