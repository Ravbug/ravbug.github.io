 /**
    Get data from remote resource
    */
   async function httpget(url){
    let temp = undefined;
    try{
        await fetch(url).then(response => response.json()).then(data=>{temp=data});
    }
    catch(e){
        return undefined;
    }
    return temp;
}

let numPackages = 0;
let hasAlerted = false;

//store as pkg@version : data
const pkgcache = {

}
const failedSet = new Set();

const counted = new Set();

//store as pkg : data
const downloadcache = {

}

async function analyzePackage(packageName, packageVersion){
    if (numPackages > 4000){
        if (!hasAlerted){
            alert("Maximum search limit of 4000 hit! The real cost of this package is higher.")
            hasAlerted = true;
        }
        return;     //prevent it from hitting a nuclear package 
    }
    const vstr = `${packageName}@${packageVersion}`;

    if (failedSet.has(vstr)){
        return; //avoid repeating failed requests
    }

    let data;
    if (!pkgcache[vstr]){
        data = (await httpget(`https://unpkg.com/${vstr}/package.json`));
        if (data == undefined || typeof data == "string" || data["error"] != undefined){
            failedSet.add(vstr);
            return;
        }
        pkgcache[vstr] = data;
    }
    else{
        data = pkgcache[vstr];
    }
    if (counted.has(vstr)){
        return; //already did this one, no need to add it again
    }
    counted.add(vstr);

    numPackages++;

    document.getElementById("output").innerHTML = `Analyzed ${numPackages} dependencies...`;

    const scores = {};

    let downloads;
    //determine download count
    if (!downloadcache[packageName]){
        downloads = (await httpget(`https://api.npmjs.org/downloads/point/last-week/${packageName}`)).downloads;
        downloadcache[packageName] = downloads;
    }
    else{
        downloads = downloadcache[packageName];
    } 
    scores["downloads"] = downloads;
    scores["data"] = data;

    //recurse dependencies
    if (data.dependencies){
        scores["deps"] = {};
        for(const name of Object.keys(data["dependencies"])){
            const version = data.dependencies[name].replace(/[^0-9.]/g,'');
            scores["deps"][name] = await analyzePackage(name,version); 
        }
    }

    //implementation complexity, determined by the size of the package
    try{
        //Query the module's directory structure
        const dirstructure = await httpget(`https://unpkg.com/${vstr}/?meta`);
        let totalSize = 0;

        function recurse_size(root){
            for(const file of root["files"]){
                if (file["type"] == "directory"){
                    recurse_size(file);
                }
                else{
                    totalSize += file["size"];
                }
            }
        }
        recurse_size(dirstructure);

        scores["lines"] = totalSize;
    }
    catch(e){
        console.error(e);
        return;
    }

    return scores;
}


async function intoxicate(){
    numPackages = 0;
    hasAlerted = false;
    const query = encodeURIComponent(document.getElementById("search").value);
    const results = (await httpget(`https://registry.npmjs.com/-/v1/search?text=${query}&size=5`)).objects;
    const scores = {};
    counted.clear();

    //determine which tests pass
    const package = results[0];
    //determine relevance
    if (package && package.searchScore > 1){
        const key = package.package.name
        
        scores[key] = {"relevance":true};
        scores[key]["data"] = package;

        scores[key] = {...scores[key],...(await analyzePackage(package.package.name,package.package.version))}
    }
    
    if (Object.keys(scores).length == 0){
        return "No packages with a similar name found. Try a different name!";
    }

    let score = 0;

    const alreadyCounted = new Set();

    function tallyPrintScore(package, existsPenalty = false){
        if (package == undefined){
            return;
        }
        const html = [];

        //score += (existsPenalty) ? 1 : 0;
        
        let isTrivial = package.lines <= 20000;
        let isOverrated = (package.downloads >= 1000) && isTrivial;
        
        const verstr = `${package.data.name}@${package.data.version}`;
        
        let include = false;
        if (!alreadyCounted.has(verstr)){
            score += isTrivial;
            score += isOverrated;
            alreadyCounted.add(verstr);
        }
        else{
            //already processed this one, stop
            return;
        }
        
        
        html.push(`
        <p>
        Name: <a href="https://www.npmjs.com/package/${package.data.name}" target="_blank">${package.data.name} v${package.data.version}</a><br>
        Description: ${package.data.description}<br>
        ${/*existsPenalty*/ false ? "Exists: ✅ (+1 🍺)<br>" : ""}
        Is Trivial: &lt; 20kb of code? ${package.lines} ${isTrivial ? "✅ (+1 🍺)" : "❌"}<br>
        Is Overrated: Trivial and &gt; 1K weekly downloads? ${package.downloads} > 1000 ${isOverrated ? "✅ (+1 🍺)" : "❌"}<br>
        `);

        //get total number of dependencies
        function getDeps(p){
            let depcount = 0;
            if (p && p["deps"]){
                for(let pkg of Object.keys(p["deps"])){
                    const t = p["deps"][pkg];
                    if(t && !alreadyCounted.has(`${t.data.name}@${t.data.version}`)){
                        depcount += getDeps(t) + 1;
                    }
                }
            }
            return depcount;
        }

        if (package.deps && Object.keys(package.deps).length > 0){
            html.push(`Unique dependencies (${getDeps(package)}):<blockquote>`)
            for(const dep of Object.values(package.deps)){
                if (dep && !alreadyCounted.has(`${dep.data.name}@${dep.data.version}`)){
                    html.push(tallyPrintScore(dep));
                }
            }
            html.push("</blockquote></p>")
        }
        else{
            html.push('</p>')
        }

        if(existsPenalty){
            html.unshift(`<h2>${package.data.name} v${package.data.version} is worth ${score} ✖ 🍺</h2>`)
        }

        document.getElementById('exportbtn').onclick = () => {exportFullHierarchy(`${package.data.name}@${package.data.version}`)};
        document.getElementById('exportbtn').style.display="";
        return html.join('');
    }

    return tallyPrintScore(Object.values(scores)[0],true);
}

function exportFullHierarchy(name){
    const full_str = document.getElementById("output").innerHTML;
    download(`${name}.html`,`<head><title>${name} Dependencies</title><meta charset=\"utf-8\"</head>` + full_str);
}

/**
	Generates a file download with supplied content and filename
*/
function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }