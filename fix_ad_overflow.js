const fs = require('fs');

const files = [
    'index.html',
    'latest-jobs.html',
    'jobs/rrb-technician-2026.html',
    'jobs/upsssc-cane-supervisor-2026.html'
];

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');

    // Fix Leaderboard overflow
    // Find the injected leaderboard tag and replace it with a responsive wrapper
    const oldLeaderboard = `<div data-placement-id="revbid-leaderboard" id='revbid-leaderboard-9455' style='min-width: 468px; min-height: 60px;text-align:center; margin: 2rem auto;'></div>`;
    const newLeaderboard = `
    <div class="w-full overflow-hidden flex justify-center my-8">
        <div data-placement-id="revbid-leaderboard" id='revbid-leaderboard-9455' style='max-width: 100%; min-height: 60px; text-align:center;'></div>
    </div>`;
    content = content.split(oldLeaderboard).join(newLeaderboard);

    // Fix Square overflow
    const oldSquare = `<div data-placement-id="revbid-square" id='revbid-square-14290' style='min-width: 300px; min-height: 250px;text-align:center; margin: 2rem auto;'></div>`;
    const newSquare = `
    <div class="w-full overflow-hidden flex justify-center my-6">
        <div data-placement-id="revbid-square" id='revbid-square-14290' style='max-width: 100%; min-width: 300px; min-height: 250px; text-align:center;'></div>
    </div>`;
    content = content.split(oldSquare).join(newSquare);

    fs.writeFileSync(f, content);
    console.log('Fixed ad overflow in ' + f);
});
