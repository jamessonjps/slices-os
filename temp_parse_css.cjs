const fs = require('fs');  
const postcss = require('postcss');  
const tailwind = require('tailwindcss');  
const css = fs.readFileSync('src/index.css','utf8');  
postcss([tailwind]).process(css,{from:'src/index.css'}).then(function(result){console.log('ok');}).catch(function(err){console.error(err);process.exit(1);});  
