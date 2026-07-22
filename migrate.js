const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const cheerio = require('cheerio');

async function migrate() {
    if (!fs.existsSync('blogger.xml')) {
        console.error('❌ Error: blogger.xml not found. Please place your Blogger backup file in this folder and rename it to "blogger.xml".');
        return;
    }

    console.log('Reading Blogger XML backup...');
    const xml = fs.readFileSync('blogger.xml', 'utf8');
    const parser = new xml2js.Parser();
    
    let result;
    try {
        result = await parser.parseStringPromise(xml);
    } catch (err) {
        console.error('❌ Error parsing XML. Make sure the file is a valid Blogger backup.', err);
        return;
    }

    // Get the base template from index.html
    const baseHtml = fs.readFileSync('index.html', 'utf8');
    
    let count = 0;
    const entries = result.feed.entry || [];
    
    for (const entry of entries) {
        // We only want published posts
        if (!entry['blogger:type'] || entry['blogger:type'][0] !== 'POST') {
            continue;
        }

        let originalUrl = null;
        if (entry.link) {
            const alternateLink = entry.link.find(l => l.$ && l.$.rel === 'alternate' && l.$.type === 'text/html');
            if (alternateLink) {
                originalUrl = alternateLink.$.href;
            }
        }

        if (!originalUrl) continue;

        try {
            const urlObj = new URL(originalUrl);
            const pathname = urlObj.pathname; // e.g. /2025/12/ssc-cgl.html
            
            if (pathname.endsWith('.html')) {
                const titleObj = entry.title[0];
                const title = (typeof titleObj === 'object' && titleObj._) ? titleObj._ : titleObj;
                
                const contentObj = entry.content[0];
                const content = (typeof contentObj === 'object' && contentObj._) ? contentObj._ : contentObj;

                // Create exact directory structure
                const fullPath = path.join(process.cwd(), pathname);
                const dir = path.dirname(fullPath);
                
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }

                // Inject content into our premium template
                const $ = cheerio.load(baseHtml);
                
                // Remove the homepage specific sections
                $('.hero, .hot-exams, .additional-categories, .state-wise-section, .seo-section').remove();
                
                // Replace the homepage columns with the actual article content
                const articleHtml = `
                    <div class="main-container">
                        <div class="article-container" style="max-width: 900px; margin: 2rem auto; padding: 3rem; background: var(--white); border: 1px solid var(--border); border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
                            <h1 style="color: var(--dark); font-size: 2.2rem; margin-bottom: 2rem; border-bottom: 2px solid var(--primary); padding-bottom: 1rem;">${title}</h1>
                            <div class="article-content" style="line-height: 1.8; color: var(--text-main); font-size: 1.05rem;">
                                ${content}
                            </div>
                        </div>
                    </div>
                `;
                
                $('main.main-container').replaceWith(articleHtml);
                $('title').text(`${title} - SarkariJobs.blog`);

                fs.writeFileSync(fullPath, $.html());
                console.log(`✅ Generated: ${pathname}`);
                count++;
            }
        } catch (e) {
            console.error(`⚠️ Error processing URL: ${originalUrl}`, e.message);
        }
    }
    
    console.log(`\n🎉 Migration complete! Successfully upgraded and generated ${count} old HTML articles.`);
    console.log(`You can now run 'git add .', 'git commit -m "migrated old posts"', and 'git push' to deploy them!`);
}

migrate();
