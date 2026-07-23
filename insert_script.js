const fs = require('fs');

const revbidScript = `<script type="text/javascript" src="//prebid.revbid.net/11356/revbid.js" async></script>`;
const files = [
    'index.html',
    'latest-jobs.html',
    'jobs/rrb-technician-2026.html',
    'jobs/upsssc-cane-supervisor-2026.html'
];

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    // Insert the script right before </head>
    if (!content.includes('revbid.js')) {
        content = content.replace(/<\/head>/, `    ${revbidScript}\n</head>`);
        fs.writeFileSync(f, content);
        console.log('Inserted Revbid script into ' + f);
    }
});
