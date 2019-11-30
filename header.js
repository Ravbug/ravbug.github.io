Object.prototype.insertAfter = function (newNode) { this.parentNode.insertBefore(newNode, this.nextSibling); }

/** Creates the header for the page
 *  Define the following variables in an earlier `<script>`:
 *  @param {string} page_title the title text for the page
 *  @param {string} page_desc the description for the page
 *  @param {number} stylesheet_depth the distance from the root dir. 0 = at root dir
 * 
 *  Optional parameters
 *  @param {string} page_meta_title The window / embed title. Uses `page_title` if undefined.
 *  @param {string} page_meta_desc The social media embed text. Uses `page_desc` if undefined.
 *  @param {url} page_favicon The icon used in embeds and in the tab. Uses the default R logo if undefined.
 */
{
    let stylesheetroot = [];
    for (let i = 0; i < stylesheet_depth; i++){
        stylesheetroot.push('../');
    }
    stylesheetroot = stylesheetroot.join('');
    let main = document.createElement('header');
    main.innerHTML = 
    `<head>
        <title>${typeof page_meta_title != "undefined" ? page_meta_title : page_title}</title>
        <meta name="description" content="${typeof page_meta_desc != "undefined"? page_meta_desc : page_desc}">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta charset="UTF-8">
        <link id="favicon" rel="icon" href="${typeof page_favicon != "undefined"? page_favicon : "https://avatars2.githubusercontent.com/u/22283943"}" type="image/x-icon">
        <link rel="stylesheet" type="text/css" href="${stylesheetroot}bootstrap.css">
        <link rel="stylesheet" type="text/css" href="${stylesheetroot}stylesheet.css">
    </head>
    
    `;
    //replace this script with main
    document.currentScript.parentElement.insertBefore(main,document.currentScript);

    //construct header
    let header = document.createElement('div');
    header.className = "jumbotron header";
    header.innerHTML = `
    <h1 style="color:white">${page_title}</h1>
    <p style="color:white">${page_desc}</p>`;

    //add the jumbotron
    document.currentScript.parentElement.insertAfter(header,document.currentScript);

    //unload this script
    document.currentScript.remove();
}