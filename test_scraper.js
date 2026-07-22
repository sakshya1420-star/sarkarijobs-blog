const axios = require('axios');
const cheerio = require('cheerio');

async function scrape() {
    try {
        const { data } = await axios.get('https://www.sarkariresult.com/');
        const $ = cheerio.load(data);
        
        console.log('Title:', $('title').text());
        
        // Find boxes with ID 'post'
        $('#post div').each((i, el) => {
            if (i < 10) {
                const htmlStr = $(el).html();
                // check if it's the box containing 'Result' or 'Admit Card'
                if (htmlStr && htmlStr.includes('Result')) {
                    console.log(`\n--- Box ${i} (Has Result) ---`);
                    const links = $(el).find('a');
                    links.each((j, link) => {
                        if (j < 5) console.log($(link).text(), $(link).attr('href'));
                    });
                }
            }
        });
    } catch (e) {
        console.error(e);
    }
}
scrape();
