const fs = require('fs');
const path = require('path');

function searchCSS(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      searchCSS(filePath);
    } else if (filePath.endsWith('.css')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('settings-form') || content.includes('form-group')) {
        console.log(`Found reference in: ${filePath}`);
        // Let's print the matching lines
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.includes('settings-form') || line.includes('form-group')) {
            console.log(`  L${index + 1}: ${line.trim()}`);
          }
        });
      }
    }
  }
}

const frontendSrc = path.join(__dirname, '../frontend/src');
searchCSS(frontendSrc);
process.exit(0);
