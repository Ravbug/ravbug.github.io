//Object.prototype.insertAfter = function (newNode) { this.parentNode.insertBefore(newNode, this.nextSibling); }

/** Creates the header for the page
 *  Define the following variables in an earlier `<script>`:
 *  @param {number} stylesheet_depth the distance from the root dir. 0 = at root dir
 * 
 */{
    let stylesheetroot = [];
    for (let i = 0; i < stylesheet_depth; i++){
        stylesheetroot.push('../');
    }

    delete stylesheet_depth;
    stylesheetroot = stylesheetroot.join('');
    var script = document.createElement('script');
    script.onload = function() {
      generate();
    };
    script.src=`${stylesheetroot}homepage.mjs`
    document.getElementsByTagName('head')[0].appendChild(script);
    function generate(){
        let body = document.getElementsByTagName("body")[0];

       
        let head = document.getElementsByTagName('head')[0];

        //get the page title and content as described in the head
        let page_title = head.getElementsByTagName('title')[0].innerText;
        let page_desc = head.getElementsByTagName('meta')[0].content;

        //head boilerplate content
        head.innerHTML += `
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta charset="UTF-8">
            <link rel="stylesheet" type="text/css" href="${stylesheetroot}bootstrap-custom.css">
            <link rel="stylesheet" type="text/css" href="${stylesheetroot}stylesheet.css">`;

        
        let menus = [`<a class="headerlink btn btn-primary" href="/">Home</a>`];
        for (let card of data){
            menus.push(`<a class="headerlink btn btn-primary header-nonessential" href="/#${card.title.toLowerCase().replace(/ /g,'_')}">${card.title}</a>`);
        }
        //construct jumbotron
        let header = document.createElement('div');
        header.className = "jumbotron header";
        header.innerHTML = `
        <span style="color:white">${page_title}</span>
        <p style="color:white">${page_desc}</p> 
        ${menus.join(' ')}
        `;

        delete data;  
        //add the jumbotron
        body.insertBefore(header,body.firstChild);
        //unload this script
        for (let script of document.scripts){
            if (script.src.includes("header.js")){
                script.remove();
            }
        }
    }
}