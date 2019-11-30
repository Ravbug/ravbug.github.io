Object.prototype.insertAfter = function (newNode) { this.parentNode.insertBefore(newNode, this.nextSibling); }

/** Creates the header for the page
 *  Define the following variables in an earlier `<script>`:
 *  @param {number} stylesheet_depth the distance from the root dir. 0 = at root dir
 * 
 */
{
    let stylesheetroot = [];
    for (let i = 0; i < stylesheet_depth; i++){
        stylesheetroot.push('../');
    }
    delete stylesheet_depth;
    stylesheetroot = stylesheetroot.join('');
    let head = document.getElementsByTagName('head')[0];

    //get the page title and content as described in the head
    let page_title = head.getElementsByTagName('title')[0].innerText;
    let page_desc = head.getElementsByTagName('meta')[0].content;

    //head boilerplate content
    head.innerHTML += `
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta charset="UTF-8">
        <link rel="stylesheet" type="text/css" href="${stylesheetroot}bootstrap.css">
        <link rel="stylesheet" type="text/css" href="${stylesheetroot}stylesheet.css">`;

    //construct jumbotron
    let header = document.createElement('div');
    header.className = "jumbotron header";
    header.innerHTML = `
    <span style="color:white">${page_title}</span>
    <p style="color:white">${page_desc}</p>`;

    //add the jumbotron
    p = document.currentScript;
    document.firstChild.append(header);
    //unload this script
    document.currentScript.remove();
}