const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/pages/Checkout.jsx',
  'src/pages/TrackOrder.jsx',
  'src/pages/MyOrders.jsx',
  'src/pages/AdminHome.jsx',
  'src/pages/MenuManagement.jsx',
  'src/pages/Orders.jsx',
  'src/pages/OrderDetail.jsx',
  'src/pages/NewOrder.jsx',
  'src/pages/Kitchen.jsx',
  'src/pages/DeliveryDashboard.jsx',
  'src/pages/Customers.jsx',
  'src/pages/Stock.jsx',
  'src/pages/Reports.jsx',
  'src/pages/Settings.jsx',
  'src/pages/UserManagement.jsx'
];

function processFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) return;

  let content = fs.readFileSync(fullPath, 'utf8');
  let original = content;

  // We use (?<!dark:) to ensure we don't match something already prefixed by dark:
  const replacements = [
    { regex: /(?<!dark:)bg-slate-50(?!\s*dark:bg-)/g, replace: 'bg-slate-50 dark:bg-slate-950' },
    { regex: /(?<!dark:)bg-white(?!\s*dark:bg-)/g, replace: 'bg-white dark:bg-slate-900' },
    { regex: /(?<!dark:)border-slate-200(?!\s*dark:border-)/g, replace: 'border-slate-200 dark:border-slate-800' },
    { regex: /(?<!dark:)border-slate-100(?!\s*dark:border-)/g, replace: 'border-slate-100 dark:border-slate-800' },
    { regex: /(?<!dark:)text-slate-900(?!\s*dark:text-)/g, replace: 'text-slate-900 dark:text-white' },
    { regex: /(?<!dark:)text-slate-800(?!\s*dark:text-)/g, replace: 'text-slate-800 dark:text-slate-200' },
    { regex: /(?<!dark:)text-slate-600(?!\s*dark:text-)/g, replace: 'text-slate-600 dark:text-slate-300' },
    { regex: /(?<!dark:)text-slate-500(?!\s*dark:text-)/g, replace: 'text-slate-500 dark:text-slate-400' },
    { regex: /(?<!dark:)bg-slate-100(?!\s*dark:bg-)/g, replace: 'bg-slate-100 dark:bg-slate-800' },
    { regex: /(?<!dark:)bg-slate-900(?!\s*dark:bg-)/g, replace: 'bg-slate-900 dark:bg-slate-100 dark:text-slate-900' }
  ];

  replacements.forEach(r => {
    content = content.replace(r.regex, r.replace);
  });

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

filesToFix.forEach(processFile);
console.log('Applied dark mode classes properly.');
