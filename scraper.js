const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Ensure the jobs directory exists
const jobsDir = path.join(__dirname, 'jobs');
if (!fs.existsSync(jobsDir)) {
    fs.mkdirSync(jobsDir, { recursive: true });
}

// Helper to generate massive SEO boilerplate content
function generateSEOContent(title, rawHtml) {
    const jobName = title.split('20')[0].trim() || title; // Rough extraction of job name
    
    const executiveSummary = `
        <div class="seo-content-block">
            <h3>Comprehensive Guide to ${title}</h3>
            <p>Welcome to the most detailed and comprehensive guide for the <strong>${title}</strong>. This highly anticipated recruitment drive offers a golden opportunity for eligible candidates across the country. In this extensive article, we will cover every single detail you need to know, including the complete eligibility criteria, detailed age limit rules, category-wise vacancy distribution, and a step-by-step guide on how to successfully submit your application without errors. Make sure to read through this entire guide to boost your chances of success.</p>
        </div>
    `;

    const howToApply = `
        <div class="seo-content-block">
            <h3>Step-by-Step Guide: How to Apply Online for ${jobName}</h3>
            <p>Filling out a government job application can be complex. Follow these precise steps to ensure your application for <strong>${jobName}</strong> is accepted without any issues:</p>
            <ol>
                <li><strong>Read the Official Notification:</strong> Before clicking the apply link, carefully read the official PDF notification to ensure you meet all the strict eligibility criteria.</li>
                <li><strong>Prepare Your Documents:</strong> Gather all necessary documents, including your 10th/12th mark sheets, degree certificates, category certificates (if applicable), and a valid ID proof (Aadhar Card, PAN Card, etc.).</li>
                <li><strong>Scan Photo & Signature:</strong> Ensure you have a recent passport-sized photograph and your signature scanned in the exact dimensions and file size (usually 20KB-50KB in JPEG format) as specified by the recruitment board.</li>
                <li><strong>Registration:</strong> Visit the official portal and complete the one-time registration (OTR) by entering your basic details, mobile number, and active email address. Verify the OTP.</li>
                <li><strong>Fill the Form:</strong> Log in with your new credentials and fill out the detailed application form. Double-check your spelling, date of birth, and category selection. <em>Warning: Incorrect details may lead to immediate rejection during document verification!</em></li>
                <li><strong>Fee Payment:</strong> Proceed to the payment gateway. Pay the required application fee via UPI, Net Banking, or Debit/Credit Card. Save the payment receipt.</li>
                <li><strong>Final Submission & Print:</strong> Submit the application and immediately download the final PDF copy. Print at least two copies for your personal records and future reference during the admit card download phase.</li>
            </ol>
        </div>
    `;

    const selectionProcess = `
        <div class="seo-content-block">
            <h3>Detailed Selection Process & Exam Pattern</h3>
            <p>The selection process for this prestigious position is rigorous and highly competitive. Candidates generally have to pass through multiple phases of evaluation:</p>
            <ul>
                <li><strong>Phase 1: Written Examination (CBT/OMR):</strong> Candidates must clear the initial objective-type test covering General Knowledge, Mathematics, Reasoning, and relevant subjects.</li>
                <li><strong>Phase 2: Physical/Skill Test (If Applicable):</strong> Depending on the exact post, candidates may need to undergo a physical endurance test (PET) or a typing/skill test.</li>
                <li><strong>Phase 3: Document Verification (DV):</strong> Original certificates will be thoroughly checked against the details provided in the online application.</li>
                <li><strong>Phase 4: Medical Examination:</strong> A final medical fitness test conducted by a designated medical board.</li>
            </ul>
        </div>
    `;

    const faqs = `
        <div class="seo-content-block faq-schema">
            <h3>Frequently Asked Questions (FAQs)</h3>
            <div class="faq-item">
                <strong>Q1: What is the last date to apply for ${jobName}?</strong>
                <p>A: The exact last date is mentioned in the important dates section above. Candidates are highly advised to apply well before the deadline to avoid last-minute server crashes.</p>
            </div>
            <div class="faq-item">
                <strong>Q2: Can candidates from other states apply?</strong>
                <p>A: Yes, generally candidates from all over India can apply, but they will be considered under the Unreserved (General) category if applying outside their home state. Always verify state-specific domicile rules in the official notification.</p>
            </div>
            <div class="faq-item">
                <strong>Q3: Is there any negative marking in the exam?</strong>
                <p>A: Most modern competitive exams have negative marking (usually 1/3rd or 1/4th marks deducted per wrong answer). Please check the official syllabus PDF for precise details.</p>
            </div>
        </div>
    `;

    // Combine everything: Executive Summary + Raw Table + Elaborated SEO Content
    return `
        <div class="article-container" style="max-width: 900px; margin: 2rem auto; padding: 3rem; background: var(--white); border: 1px solid var(--border); border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
            <h1 style="color: var(--dark); font-size: 2.2rem; margin-bottom: 2rem; border-bottom: 2px solid var(--primary); padding-bottom: 1rem;">${title}</h1>
            
            ${executiveSummary}
            
            <div class="original-data-table" style="overflow-x: auto; margin: 2rem 0; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem;">
                ${rawHtml}
            </div>

            ${howToApply}
            ${selectionProcess}
            ${faqs}
        </div>
    `;
}

async function deepScrapeJob(url, text) {
    if (!url.includes('sarkariresult.com')) {
        return url; // Return original if not sarkari
    }

    try {
        const slug = url.split('/').filter(Boolean).pop().replace('.php', '') + '.html';
        const localPath = `/jobs/${slug}`;
        const absolutePath = path.join(jobsDir, slug);

        // If we already scraped it, just return the local path to save time
        if (fs.existsSync(absolutePath)) {
            return localPath;
        }

        console.log(`Deep scraping: ${url}`);
        const { data } = await axios.get(url, { timeout: 10000 });
        const $ = cheerio.load(data);
        
        // Extract the main content table from SarkariResult (they usually put content in #post or tables)
        let rawContent = $('#post').html() || $('table').first().html() || '<p>Detailed notification available on official site.</p>';
        
        // Sanitize raw content (remove their ads, scripts, etc.)
        const $content = cheerio.load(rawContent);
        $content('script, style, iframe, ins').remove();
        rawContent = $content.html();

        // Generate the massive SEO article
        const fullArticleHtml = generateSEOContent(text, rawContent);

        // Inject into our premium template
        const baseHtml = fs.readFileSync('index.html', 'utf8');
        const $base = cheerio.load(baseHtml);
        
        // Remove homepage specific widgets
        $base('.hero, .hot-exams, .additional-categories, .state-wise-section, .seo-section').remove();
        $base('main.main-container').replaceWith(fullArticleHtml);
        $base('title').text(`${text} - SarkariJobs.blog`);

        // Save the local HTML file
        fs.writeFileSync(absolutePath, $base.html());
        console.log(`✅ Generated 1500+ word article: ${localPath}`);
        
        return localPath;
    } catch (e) {
        console.error(`❌ Failed to deep scrape ${url}: ${e.message}`);
        return url; // Fallback to original url on failure
    }
}

async function runScraper() {
    console.log('Starting SarkariJobs Deep Auto-Scraper...');
    try {
        const { data } = await axios.get('https://www.sarkariresult.com/', { timeout: 15000 });
        const $ = cheerio.load(data);
        
        const results = [];
        const admitCards = [];
        const latestJobs = [];

        // Simple heuristic extraction from homepage
        $('a').each((i, el) => {
            const text = $(el).text().trim();
            const href = $(el).attr('href');
            if (!text || !href || href === '#' || href === '/') return;

            if (text.toLowerCase().includes('result')) {
                if (results.length < 5) results.push({ text, href });
            } else if (text.toLowerCase().includes('admit card')) {
                if (admitCards.length < 5) admitCards.push({ text, href });
            } else if (text.toLowerCase().includes('online form') || text.toLowerCase().includes('apply')) {
                if (latestJobs.length < 5) latestJobs.push({ text, href });
            }
        });

        // Now, we deep scrape and generate local files for all of them
        console.log(`Found ${results.length} Results, ${admitCards.length} Admit Cards, ${latestJobs.length} Jobs. Generating content...`);

        for (let i = 0; i < results.length; i++) {
            results[i].localHref = await deepScrapeJob(results[i].href, results[i].text);
        }
        for (let i = 0; i < admitCards.length; i++) {
            admitCards[i].localHref = await deepScrapeJob(admitCards[i].href, admitCards[i].text);
        }
        for (let i = 0; i < latestJobs.length; i++) {
            latestJobs[i].localHref = await deepScrapeJob(latestJobs[i].href, latestJobs[i].text);
        }

        // Update index.html
        let html = fs.readFileSync('index.html', 'utf8');
        const $html = cheerio.load(html);

        const resultsList = $html('.results-header').next('.job-list');
        resultsList.empty();
        results.forEach((item, index) => {
            const badge = index === 0 ? ' <span class="badge red">Hot</span>' : '';
            resultsList.append(`<li><a href="${item.localHref}">${item.text}</a>${badge}</li>`);
        });

        const admitList = $html('.admit-header').next('.job-list');
        admitList.empty();
        admitCards.forEach((item, index) => {
            const badge = index === 0 ? ' <span class="badge blue">New</span>' : '';
            admitList.append(`<li><a href="${item.localHref}">${item.text}</a>${badge}</li>`);
        });

        const jobsList = $html('.jobs-header').next('.job-list');
        jobsList.empty();
        latestJobs.forEach((item, index) => {
            const badge = index === 0 ? ' <span class="badge green">Apply</span>' : '';
            jobsList.append(`<li><a href="${item.localHref}">${item.text}</a>${badge}</li>`);
        });

        fs.writeFileSync('index.html', $html.html());
        console.log('🎉 Scraper successfully generated content and updated index.html!');

    } catch (e) {
        console.error('❌ Scraper Failed:', e.message);
    }
}

runScraper();
