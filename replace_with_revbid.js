const fs = require('fs');

const revbidSquare = `<div data-placement-id="revbid-square" id='revbid-square-14290' style='min-width: 300px; min-height: 250px;text-align:center; margin: 2rem auto;'></div>`;
const revbidLeaderboard = `<div data-placement-id="revbid-leaderboard" id='revbid-leaderboard-9455' style='min-width: 468px; min-height: 60px;text-align:center; margin: 2rem auto;'></div>`;

const files = [
    'index.html',
    'latest-jobs.html',
    'jobs/rrb-technician-2026.html',
    'jobs/upsssc-cane-supervisor-2026.html'
];

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');

    // Replace Leaderboard Placeholders
    // Match the entire AD SLOT block for Leaderboard
    content = content.replace(/<!-- AD SLOT: Leaderboard -->[\s\S]*?<\/div>/g, revbidLeaderboard);

    // Replace Square Placeholders
    // Match the entire AD SLOT block for In-Feed, Sidebar, and In-Article
    content = content.replace(/<!-- AD SLOT: In-Feed Native -->[\s\S]*?<\/div>/g, revbidSquare);
    content = content.replace(/<!-- AD SLOT: Sticky Sidebar -->[\s\S]*?<\/div>/g, revbidSquare);
    content = content.replace(/<!-- AD SLOT: In-Article -->[\s\S]*?<\/div>/g, revbidSquare);

    fs.writeFileSync(f, content);
    console.log('Updated ' + f);
});
