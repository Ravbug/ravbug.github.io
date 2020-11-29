 /**
    Get data from remote resource
    */
   async function httpget(url){
    let temp;
    await fetch(url).then(response => response.json()).then(data=>{temp=data});
    return temp;
}

let numPackages = 0;
let hasAlerted = false;

//store as pkg@version : data
const pkgcache = {

}
const failedSet = new Set();

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
        data = (await httpget(`https://r.cnpmjs.org/${packageName}/${packageVersion}`).catch(()=>{alert("Rate limit error. Please wait a few minutes, then try again.")}));
        if (typeof data == "string" || data["error"] != undefined){
            failedSet.add(vstr);
            return;
        }
        pkgcache[vstr] = data;
    }
    else{
        data = pkgcache[vstr];
    }
    numPackages++;

    document.getElementById("output").innerHTML = `Analyzed ${numPackages} packages...`;

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
        scores["lines"] = (data["dist"]["size"] == undefined ? -1 : data["dist"]["size"]);
    }
    catch(e){
        return;
    }

    //determine implementation complexity
    //this is determined by the amount of "bytes" of code
    // if (data.repository && data.repository.url.includes("github")){
    //     //find location of "github.com"
    //     let pos = data.repository.url.indexOf("github.com");
    //     let repo = data.repository.url.substring(pos + "github.com/".length);

    //     //find location of ".git"
    //     pos = repo.includes(".git")

    //     //query github
    //     repo = repo.substring(0,repo.length - (pos ? ".git".length : 0));
    //     let url = `https://api.github.com/repos/${repo}/languages`;
    //     const langs = (await httpget(url).catch(()=>{alert("Too fast! Wait a minute and try again")}));

    //     let total = 0;  //amount of "bytes" of code present in this repo
    //     for(let val of Object.values(langs)){
    //         total += val;
    //     }
    //     scores["lines"] = total;
    // }
    // else{
    //     scores["lines"] = -1; //cannot verify
    // }

    return scores;
}


async function intoxicate(){
    numPackages = 0;
    hasAlerted = false;
    const query = encodeURIComponent(document.getElementById("search").value);
    const results = (await httpget(`https://registry.npmjs.com/-/v1/search?text=${query}&size=5`)).objects;
    const scores = {};

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
    const alreadyRecursed = new Set();

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
        Name: <a href="https://www.npmjs.com/package/${package.data.name}" target="_blank">${package.data.name}</a><br>
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
                    if(t && !alreadyCounted.has(`${t.data.name}@${t.data.version}`) && !alreadyRecursed.has(`${t.data.name}@${t.data.version}`)){
                        depcount += getDeps(t) + 1;
                        alreadyRecursed.add(`${t.data.name}@${t.data.version}`)
                    }
                }
            }
            return depcount;
        }

        if (package.deps && Object.keys(package.deps).length > 0){
            html.push(`Dependencies (${getDeps(package)}):<blockquote>`)
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
            html.unshift(`<h2>This package is worth ${score}x🍺</h2>`)
        }

        return html.join('');
    }

    return tallyPrintScore(Object.values(scores)[0],true);
}