const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

const filesToCopy = [
  'index.html', 'login.html', 'profile.html', 'quiz.html', 'rankcard.html',
  'manifest.json', 'sw.js', 'notifications.js', 'icon-512x512.png'
];

filesToCopy.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    fs.copyFileSync(path.join(__dirname, file), path.join(publicDir, file));
    console.log(`Copied ${file} to public/`);
  }
});
console.log('Build completed: static files copied to public/');
