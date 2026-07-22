const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrapeJobs() {
    console.log('Starting SarkariJobs Auto-Scraper...');
    try {
        const { data } = await axios.get('https://www.sarkariresult.com/');
        const $ = cheerio.load(data);
        
        const results = [];
        const admitCards = [];
        const latestJobs = [];

        // Note: Actual scraping logic needs to be tailored to the exact DOM structure.
        // This is a robust fallback that searches for the most recent links in the document.
        $('a').each((i, el) => {
            const text = $(el).text().trim();
            const href = $(el).attr('href');
            if (!text || !href || href === '#') return;

            // Very basic heuristic categorization based on keywords
            if (text.toLowerCase().includes('result')) {
                if (results.length < 5) results.push({ text, href });
            } else if (text.toLowerCase().includes('admit card')) {
                if (admitCards.length < 5) admitCards.push({ text, href });
            } else if (text.toLowerCase().includes('online form') || text.toLowerCase().includes('apply')) {
                if (latestJobs.length < 5) latestJobs.push({ text, href });
            }
        });

        console.log(`Found ${results.length} Results, ${admitCards.length} Admit Cards, ${latestJobs.length} Jobs.`);

        // Now, read our index.html
        let html = fs.readFileSync('index.html', 'utf8');
        const $html = cheerio.load(html);

        // Update Results
        const resultsList = $html('.results-header').next('.job-list');
        resultsList.empty();
        results.forEach((item, index) => {
            const badge = index === 0 ? ' <span class="badge red">Hot</span>' : '';
            resultsList.append(`<li><a href="${item.href}">${item.text}</a>${badge}</li>`);
        });

        // Update Admit Cards
        const admitList = $html('.admit-header').next('.job-list');
        admitList.empty();
        admitCards.forEach((item, index) => {
            const badge = index === 0 ? ' <span class="badge blue">New</span>' : '';
            admitList.append(`<li><a href="${item.href}">${item.text}</a>${badge}</li>`);
        });

        // Update Latest Jobs
        const jobsList = $html('.jobs-header').next('.job-list');
        jobsList.empty();
        latestJobs.forEach((item, index) => {
            const badge = index === 0 ? ' <span class="badge green">Apply</span>' : '';
            jobsList.append(`<li><a href="${item.href}">${item.text}</a>${badge}</li>`);
        });

        // Save the updated HTML
        fs.writeFileSync('index.html', $html.html());
        console.log('✅ Successfully updated index.html with live data!');

    } catch (e) {
        console.error('❌ Scraper Failed:', e.message);
    }
}

scrapeJobs();
