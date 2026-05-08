const fs = require('fs');  
const postcss = require('postcss');  
const css = fs.readFileSync('src/index.css','utf8');  
const root = postcss.parse(css,{from:'src/index.css'});  
console.log('ok', root.nodes.length);  
