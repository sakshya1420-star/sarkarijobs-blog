const fs = require('fs');
const index = fs.readFileSync('index.html', 'utf8');
const headerMatch = index.match(/<head>[\s\S]*?<\/header>/);
const footerMatch = index.match(/<!-- SEO Footer Content[\s\S]*?<\/html>/);

if (!headerMatch || !footerMatch) {
    console.error("Could not find header or footer in index.html");
    process.exit(1);
}

const header = headerMatch[0];
const footer = footerMatch[0];

['jobs/rrb-technician-2026.html', 'jobs/upsssc-cane-supervisor-2026.html', 'latest-jobs.html'].forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    
    // Replace html tag
    content = content.replace(/<html[^>]*>/, '<html lang="en" class="dark">');
    // Replace body tag
    content = content.replace(/<body[^>]*>/, '<body class="bg-darkbg text-gray-200 antialiased">');
    
    // Replace from <head> to </nav> with the new header
    // In index.html, it's </header>, in the blogs it was </nav> but now we replace up to </header> if it exists, or </nav>
    let newHeader = header;
    if (f.startsWith('jobs/')) {
        newHeader = newHeader.replace(/href="style\.css"/g, 'href="../style.css"');
    }
    
    // Remove old head and nav/header
    content = content.replace(/<head>[\s\S]*?(<\/nav>|<\/header>)/, newHeader);
    
    // Remove old footer to end
    content = content.replace(/<footer[\s\S]*?<\/html>/, footer);
    
    fs.writeFileSync(f, content);
    console.log('Updated ' + f);
});
