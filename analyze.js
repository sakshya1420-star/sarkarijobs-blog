const cheerio = require('cheerio');
const fs = require('fs');
const $ = cheerio.load(fs.readFileSync('gtaboom.html'));
console.log('Title:', $('title').text());
console.log('Body classes:', $('body').attr('class'));
console.log('Header:', $('header').attr('id'), $('header').attr('class'));
console.log('Main Layout Classes:', $('#main').attr('class') || $('.main').attr('class') || $('main').attr('class'));
console.log('Main Content wrapper classes:', $('#primary').attr('class') || $('.content-area').attr('class'));
console.log('Sidebar classes:', $('#secondary').attr('class') || $('.sidebar').attr('class'));
