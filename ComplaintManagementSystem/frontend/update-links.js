const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/HP/Desktop/internship project/ComplaintManagementSystem/frontend';

function replaceInFile(file, replacements) {
  const filepath = path.join(dir, file);
  if (!fs.existsSync(filepath)) return;
  
  let content = fs.readFileSync(filepath, 'utf8');
  for (const [search, replace] of replacements) {
    content = content.replace(search, replace);
  }
  fs.writeFileSync(filepath, content);
}

// 1. In the new index.html (landing page), replace href="index.html" with href="login.html" 
// and href="home.html" with href="index.html"
replaceInFile('index.html', [
  [/href="index\.html"/g, 'href="login.html"'],
  [/href="home\.html"/g, 'href="index.html"']
]);

// 2. In login.html, replace href="home.html" with href="index.html"
replaceInFile('login.html', [
  [/href="home\.html"/g, 'href="index.html"']
]);

// 3. In admin-login.html, replace href="index.html" with href="login.html"
replaceInFile('admin-login.html', [
  [/href="index\.html"/g, 'href="login.html"']
]);

// 4. In js/api.js, replace 'index.html' with 'login.html'
replaceInFile('js/api.js', [
  [/'index\.html'/g, "'login.html'"]
]);

console.log('Update complete.');
