const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'app');

const replaceRules = [
  { match: /bg-slate-950/g, replace: 'bg-background' },
  { match: /bg-slate-900/g, replace: 'bg-card' },
  { match: /border-slate-800/g, replace: 'border-border' },
  { match: /bg-blue-600/g, replace: 'bg-primary text-primary-foreground' },
  { match: /bg-blue-500/g, replace: 'bg-primary' },
  { match: /text-blue-400/g, replace: 'text-primary' },
  { match: /text-blue-300/g, replace: 'text-primary/80' },
  { match: /text-blue-500/g, replace: 'text-primary' },
  { match: /text-blue-600/g, replace: 'text-primary' },
  { match: /border-blue-500/g, replace: 'border-primary' },
  { match: /border-blue-400/g, replace: 'border-primary/80' },
  { match: /ring-blue-500/g, replace: 'ring-primary' },
  { match: /shadow-blue-600/g, replace: 'shadow-primary' },
  { match: /shadow-blue-500/g, replace: 'shadow-primary' },
  { match: /hover:bg-blue-600/g, replace: 'hover:bg-primary/90' },
  { match: /hover:bg-blue-500/g, replace: 'hover:bg-primary/80' },
  { match: /hover:text-blue-400/g, replace: 'hover:text-primary' },
  { match: /hover:text-blue-300/g, replace: 'hover:text-primary/80' },
  { match: /hover:border-blue-500/g, replace: 'hover:border-primary' },
  { match: /focus:ring-blue-500/g, replace: 'focus:ring-primary' },
  // Be careful with opacities like bg-blue-500/10
  { match: /bg-blue-\d{3}\/(\d+)/g, replace: 'bg-primary/$1' },
  { match: /border-blue-\d{3}\/(\d+)/g, replace: 'border-primary/$1' },
  { match: /text-blue-\d{3}\/(\d+)/g, replace: 'text-primary/$1' },
  { match: /shadow-blue-\d{3}\/(\d+)/g, replace: 'shadow-primary/$1' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let newContent = content;
      
      for (const rule of replaceRules) {
        newContent = newContent.replace(rule.match, rule.replace);
      }

      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(targetDir);
console.log('Done replacing theme colors.');
