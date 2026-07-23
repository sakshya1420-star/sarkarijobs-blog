const fs = require('fs');

const files = [
    'index.html',
    'latest-jobs.html',
    'jobs/rrb-technician-2026.html',
    'jobs/upsssc-cane-supervisor-2026.html'
];

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');

    // Make leaderboard responsive (320x50 on mobile, 728x90 on desktop)
    content = content.replace(/h-\[90px\]/g, 'h-[50px] md:h-[90px]');
    content = content.replace(/Advertisement \(728x90\)/g, 'Ad (Mobile: 320x50 | Desktop: 728x90)');

    // Ensure in-feed ads adapt height if necessary, though h-[250px] is fine on mobile usually (300x250 square)
    // Sidebar ad is h-[600px] which is massive on mobile, let's make it hide or shrink on mobile, or just leave it since it wraps below
    content = content.replace(/h-\[600px\]/g, 'h-[250px] md:h-[600px]');
    content = content.replace(/\(300x600 Half Page\)/g, '(Desktop: 300x600 | Mobile: 300x250)');

    fs.writeFileSync(f, content);
    console.log('Updated ' + f);
});
