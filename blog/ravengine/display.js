{


    let html = [];
    const entry = "ravengine"
        for(let page of pages[entry]["pages"]){
            html.push(`<li><a href="${document.currentScript.getAttribute('pathroot')}/${page.url}/">${page.title}</a></li>`);
        }
        html.push("</ul>")
    delete pages;
    document.currentScript.outerHTML = `<ul>${html.join('')}</ul>`
}