const fs = require('fs');

const leaderboardAd = `
    <!-- AD SLOT: Leaderboard -->
    <div class="ad-placeholder w-full max-w-4xl mx-auto h-[90px] bg-cardbg border border-bordercolor flex items-center justify-center my-6 rounded">
        <span class="text-gray-500 text-sm uppercase tracking-widest">Advertisement (728x90)</span>
    </div>
`;

const inFeedAd = `
    <!-- AD SLOT: In-Feed Native -->
    <div class="ad-placeholder w-full h-[250px] bg-cardbg border border-bordercolor flex items-center justify-center my-6 rounded-xl border-dashed">
        <span class="text-gray-500 text-sm uppercase tracking-widest">Advertisement (Native/In-Feed)</span>
    </div>
`;

const sidebarAd = `
    <!-- AD SLOT: Sticky Sidebar -->
    <div class="ad-placeholder w-full h-[600px] bg-cardbg border border-bordercolor flex items-center justify-center rounded-xl sticky top-24 border-dashed mt-8">
        <span class="text-gray-500 text-sm uppercase tracking-widest text-center px-4">Advertisement<br>(300x600 Half Page)</span>
    </div>
`;

const inArticleAd = `
    <!-- AD SLOT: In-Article -->
    <div class="ad-placeholder w-full h-[250px] bg-[#0f172a] border border-[#334155] flex items-center justify-center my-8 rounded border-dashed">
        <span class="text-gray-400 text-sm uppercase tracking-widest">Advertisement</span>
    </div>
`;

// 1. Update index.html
let indexHtml = fs.readFileSync('index.html', 'utf8');
// Insert leaderboard after <header>
indexHtml = indexHtml.replace(/(<\/header>)/, '$1' + leaderboardAd);
// Insert in-feed ad after the first <article> in the feed
indexHtml = indexHtml.replace(/(<\/article>)/, '$1\n' + inFeedAd);
// Insert sidebar ad at the end of <aside>
indexHtml = indexHtml.replace(/(<\/aside>)/, sidebarAd + '\n$1');
fs.writeFileSync('index.html', indexHtml);
console.log('Updated index.html');

// 2. Update latest-jobs.html
let latestJobsHtml = fs.readFileSync('latest-jobs.html', 'utf8');
latestJobsHtml = latestJobsHtml.replace(/(<\/header>)/, '$1' + leaderboardAd);
// For the grid, insert an ad as a grid item after the 3rd item
let gridMatches = latestJobsHtml.match(/<a href="[^"]+" class="flex flex-col[^>]+>[\s\S]*?<\/a>/g);
if (gridMatches && gridMatches.length > 3) {
    let thirdItem = gridMatches[2];
    latestJobsHtml = latestJobsHtml.replace(thirdItem, thirdItem + '\n' + inFeedAd.replace('w-full', 'w-full h-full min-h-[300px]'));
}
fs.writeFileSync('latest-jobs.html', latestJobsHtml);
console.log('Updated latest-jobs.html');

// 3. Update blog posts
['jobs/rrb-technician-2026.html', 'jobs/upsssc-cane-supervisor-2026.html'].forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    // Ad after executive summary
    content = content.replace(/(<\/div>\s*<h2)/, '\n' + inArticleAd + '\n$1');
    // Ad before the Apply button div
    content = content.replace(/(<div style="text-align: center; margin-top: 4rem;">)/, inArticleAd + '\n$1');
    fs.writeFileSync(f, content);
    console.log('Updated ' + f);
});
