const fs = require('fs');
const path = require('path');
const dir = './src/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));
const replacements = {
  'Ã£': 'ã', 'Ã§': 'ç', 'Ã¡': 'á', 'Ã³': 'ó', 'Ã©': 'é', 'Ã­': 'í',
  'Ãª': 'ê', 'Ãµ': 'õ', 'Ã¢': 'â', 'Ã': 'Á', 'Ã‰': 'É', 'Ã“': 'Ó',
  'Ã‡': 'Ç', 'Ã€': 'À', 'Ãº': 'ú', 'Ã ': 'à', 'Â': '',
  'ðŸ •': '🍕', 'ðŸ”¢': '🔢', 'ðŸ‘¤': '👤', 'ðŸ“ž': '📞', 'ðŸ›’': '🛒',
  'ðŸ’°': '💰', 'ðŸšš': '🚚', 'â­ ': '⭐', 'ðŸ’³': '💳', 'ðŸ”‘': '🔑',
  'âš\xA0ï¸ ': '⚠️', 'ðŸ“ ': '📍', 'âœ…': '✅', 'ðŸ›µ': '🛵', 'â ±ï¸ ': '⏱️', 'ðŸ˜Š': '😊', 'â ¤ï¸ ': '❤️'
};

files.forEach(f => {
  const p = path.join(dir, f);
  let content = fs.readFileSync(p, 'utf8');
  let changed = false;
  for (const [bad, good] of Object.entries(replacements)) {
    if (content.includes(bad)) {
      content = content.split(bad).join(good);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(p, content, 'utf8');
    console.log('Fixed', f);
  }
});
