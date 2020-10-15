{
    let html = [];
    for(let entry of Object.keys(pages)){
        html.push(`<h3>${pages[entry].display}</h3><ul>`)
        for(let page of pages[entry]["pages"]){
            html.push(`<li><a href="${entry}/${page.url}/">${page.title}</a></li>`);
        }
        html.push("</ul>")
    }
    delete pages;
    document.currentScript.outerHTML = `<ul>${html.join('')}</ul>`
}
