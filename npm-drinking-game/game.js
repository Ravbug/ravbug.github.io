 /**
    Get data from remote resource
    */
   async function httpget(url){
    let temp;
    await fetch(url).then(response => response.json()).then(data=>{temp=data});
    return temp;
}

let numPackages = 0;

async function analyzePackage(packageName, packageVersion){
    const data = await httpget(`https://r.cnpmjs.org/${packageName}/${packageVersion}`);
    if (typeof data == "string"){
        return;
    }
    numPackages++;

    document.getElementById("output").innerHTML = `Analyzed ${numPackages} packages...`;

    const scores = {};

    //determine implementation complexity
    if (data.repository && data.repository.url.includes("github")){
        //TODO: use github api to determine complexity
        //iterate and count lines, skip files with "test" in the name or path
        const repo = data.repository.url.substring("https://github.com/".length);
       // console.log(repo)

        //const files = httpget(`https://api.github.com/search/code?q=extension:js+repo:${repo}`);
        scores["lines"] = 30;
    }
    else{
        scores["lines"] = -1; //cannot verify
    }

    //determine download count
    const downloads = (await httpget(`https://api.npmjs.org/downloads/point/last-week/${packageName}`)).downloads;
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

    return scores;
}


async function intoxicate(){
    numPackages = 0;
    const query = encodeURIComponent(document.getElementById("search").value);
    const results = (await httpget(`https://registry.npmjs.com/-/v1/search?text=${query}&size=5`)).objects;
    const scores = {};

    //determine which tests pass
    for(const package of results){
        //determine relevance
        if (package.searchScore > 1){
            const key = package.package.name
            
            scores[key] = {"relevance":true};
            scores[key]["data"] = package;

            scores[key] = {...scores[key],...(await analyzePackage(package.package.name,package.package.version))}
        }
    }
    console.log(scores);

    const html = [];
    //tally up the scores
    for(const package of Object.values(scores)){

        let immediateScore = 1;
        if (package.lines >= 30) immediateScore++;
        if (package.downloads > 100) immediateScore++;

        html.push(`
        Name: ${package.data.name}<br>
        Description: ${package.data.description}<br>
        Exists: ✅ (+1 🍺)<br>
        &lt; 30 lines: ${package.lines >= 30 ? "✅ (+1 🍺)" : "❌"}<br>
        &gt; 1K weekly downloads: ${package.downloads} > 1000 ${package.downloads >= 1000 ? "✅ (+1 🍺)" : "❌"}<br>
        `);

        function evaluate_deps(pkg){
            if (pkg == undefined){
                return;
            }
            if (pkg.lines >= 30) immediateScore++;
            if (pkg.downloads > 100) immediateScore++;
            html.push(`
            Name: ${pkg.data.name}<br>
            Description: ${pkg.data.description}<br>
            &lt; 30 lines: ${pkg.lines >= 30 ? "✅ (+1 🍺)" : "❌"}<br>
            &gt; 1K weekly downloads: ${pkg.downloads} > 1000 ${pkg.downloads >= 1000 ? "✅ (+1 🍺)" : "❌"}<br>
            `);
            if (pkg.deps && Object.keys(pkg.deps).length > 0){
                html.push("Dependencies:<blockquote>")
                for(const dep of Object.values(pkg.deps)){
                    evaluate_deps(dep);
                }
                html.push("</blockquote>")
            }
        }
        if (package.deps && Object.keys(package.deps).length > 0){
            html.push("Dependencies:<blockquote>")
            for(const dep of Object.values(package.deps)){
                evaluate_deps(dep);
            }
            html.push("</blockquote>")
        }
        html.push(`<h2>This package is worth ${immediateScore}x🍺`)
    }

    return html.join('');
}