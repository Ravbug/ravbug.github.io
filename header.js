//Object.prototype.insertAfter = function (newNode) { this.parentNode.insertBefore(newNode, this.nextSibling); }

/** Creates the header for the page
 *  Define the following variables in an earlier `<script>`:
 *  @param {number} stylesheetroot string containing "../" to get correct directories
 * 
 */{
    function generateHeaderContent(stylesheetroot){
        const body = document.getElementsByTagName("body")[0];

       
        const head = document.getElementsByTagName('head')[0];

        //get the page title and content as described in the head
        const page_title = head.getElementsByTagName('title')[0].innerText;
        const page_desc = head.getElementsByTagName('meta')[0].content;

        //head boilerplate content
        head.innerHTML += `
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta charset="UTF-8">
            <link rel="stylesheet" type="text/css" href="${stylesheetroot}bootstrap-custom.css">
            <link rel="stylesheet" type="text/css" href="${stylesheetroot}stylesheet.css">`;

        
        const menus = [`<a class="headerlink btn btn-primary" href="/">Home</a>`];
        for (const card of Object.values(data)){
            menus.push(`<a class="headerlink btn btn-primary header-nonessential" href="/#${card.title.toLowerCase().replace(/ /g,'_')}">${card.title}</a>`);
        }

        function getFavicon(){
            let favicon = undefined;
            let nodeList = document.getElementsByTagName("link");
            for (let i = 0; i < nodeList.length; i++)
            {
                if((nodeList[i].getAttribute("rel") == "icon")||(nodeList[i].getAttribute("rel") == "shortcut icon"))
                {
                    favicon = nodeList[i].getAttribute("href");
                }
            }
            return favicon;
        }

        //construct jumbotron
        const header = document.createElement('div');
        header.className = "jumbotron header";
        header.innerHTML = `
        <div style="display:grid;grid-template-columns:100px 1fr;grid-template-rows:1fr;gap:10px;padding-bottom:10px">
            <img src=${getFavicon()} style="width:100%;height:100%;max-width:100px;max-height:100px">
            <div>
                <span style="color:white">${page_title}</span>
                <p style="color:white">${page_desc}</p> 
            </div>
        </div>
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

    //derive the stylesheet relative position
    let stylesheet_depth = 0;
    //local or hosted relative paths
    if (window.location.protocol === "file:"){
        //substring to repository name: ravbug.github.io
        const reponame = "ravbug.github.io";
        let relativepath = window.location.pathname.substring(window.location.pathname.indexOf(reponame)+reponame.length+1);
        //count slashes in path
        stylesheet_depth = relativepath.match(/\//g).length;
    }
    else{
        let path = window.location.pathname;
        //count slashes in path and subtract one if last character in path is a /
        stylesheet_depth = path.match(/\//g).length - (path[path.length-1] === "/"? 1 : 0);
    }

    let stylesheetroot = [];
    for (let i = 0; i < stylesheet_depth; i++){
        stylesheetroot.push('../');
    }

    //delete stylesheet_depth;
    stylesheetroot = stylesheetroot.join('');
    var script = document.createElement('script');
    script.onload = function() {
      generateHeaderContent(stylesheetroot);
    };
    script.src=`${stylesheetroot}homepage.mjs`
    document.getElementsByTagName('head')[0].appendChild(script);
}