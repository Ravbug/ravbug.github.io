 /**
Get data from remote resource
*/
const cache = {}
async function httpget(url){
    // have we cached this?
    let temp = undefined;
    if (temp = cache[url]){
        if (Object.keys(temp).length == 0){
            return undefined
        }
        else{
            return temp;
        }
    }
    try{
        await fetch(url).then(response => response.json()).then(data=>{temp=data});
    }
    catch(e){
        cache[url] = {}
        return undefined;
    }
    cache[url] = temp
    return temp;
}
let count_optional = false
let pkg_cache = {}
async function interrogate_package(package_name,version=undefined,override=false){
    function name_for_pkg(name,version){
        return `${name}@${version}`
    }

    //early-out if we have already done this package
    let details;
    if (details = pkg_cache[name_for_pkg(package_name,version)]){
        return override ? details : undefined; // we have already done this package, don't count it again
    }
    else{
        details = {}
    }

    let url;
    if (/*version == undefined*/true){
        url = `https://pypi.org/pypi/${package_name}/json`
    }
    else{
        url = `https://pypi.org/pypi/${package_name}/${version}/json`
    }

    const packagedetails = await httpget(url)
    if (packagedetails == undefined){
        //error occurred
        console.error(`No package found for ${package_name}`)
        return undefined;
    }
    else{
        // get basic package stats
        details["name"] = package_name
        details["desc"] = packagedetails["info"]["summary"]

        pkg_cache[name_for_pkg(package_name,version)] = details
        const allvers = Object.keys(packagedetails["releases"])
        if (version == undefined || packagedetails["releases"][version] == undefined){
            version = allvers[allvers.length - 1]
        }

        details["version"] = version

        const all_versions = packagedetails["releases"][version]
        let size = 0
        for (const ver of all_versions){
            size += ver["size"]
        }
        size /= all_versions.length
        details["size"] = Math.round(size)

        //output progress
        totalpackages++;
        document.getElementById("output").innerHTML = `Analyzed ${totalpackages} dependencies...`;

        // determine the dependencies for this package
        const deps = packagedetails["info"]["requires_dist"]
        details["deps"] = []
        if (deps != null){
            for(const dep of deps){
                const depinfo = dep.split('(')
                let name = depinfo[0].split(' ')[0].trim();
                name = name.match(/^[a-z0-9._-]+/)

                let version = depinfo.length > 1 ? depinfo[1].match(/\d+/g) : undefined
                if (version != undefined){
                    version = version.join('.')
                }

                const dep_data = await interrogate_package(name, version);
                if (dep_data != undefined){
                    details["deps"].push(dep_data)
                }
            }
        }
    }

    return details
}

let totalpackages = 0
async function intoxicate(in_name){
    pkg_cache = {}
    totalpackages = 0
    // query cargo to determine if a package exists
    const package = await interrogate_package(in_name,undefined,true)

    if (package == undefined){
        return `No package found for <code>${in_name}</code>`
    }

    const final_html = []
    let total = 0;

    function doTest(condition){
        if (condition){
            total++
            final_html.push('+1 🍺')
        }
        else{
            final_html.push('❌')
        }
        return condition
    }

    function total_deps_for(pkg){
        let count = pkg["deps"].length;
        for(const dep of pkg["deps"]){
            count += total_deps_for(dep)
        }
        return count;
    }

    function gen_package(pkg){
        final_html.push(`<a href="https://pypi.org/project/${pkg["name"]}">${pkg["name"]} v${pkg["version"]}</a><br>${pkg["desc"]}`);

        // is trivial? 
        final_html.push(`<br> Is Trivial? Size: ${pkg["size"]} < 50,000? `)
        const trivial = doTest(pkg["size"] == undefined || pkg["size"] < 50000)

       // dependencyitis?
       const num_deps = total_deps_for(pkg);
       final_html.push(`<br> Has dependencyitis? trivial && ${num_deps} > 3? `)
       const itis = doTest(trivial && num_deps > 3)

        // recurse dependencies
        if (pkg["deps"].length > 0){
            final_html.push(`<br> Unique dependencies (${num_deps}): <blockquote>`)
            for(const dep of pkg["deps"]){
                gen_package(dep)
            }
            final_html.push(`</blockquote>`)
        }
        else{
            final_html.push(`<br><br>`)
        }
    }

    // rank the package by recursively descending the tree
    gen_package(package)

    final_html.unshift(`<h3>${package["name"]} v${package["version"]} is worth ${total} ✖ 🍺</h3>`)

    // show export buttons
    document.getElementById('exportbtn').onclick = () => {exportFullHierarchy(`${package["name"]}-v${package["version"]}`)};
    document.getElementById('exportbtn').style.display="";

    return final_html.join('');
}

function exportFullHierarchy(name){
    const full_str = document.getElementById("output").innerHTML;
    download(`${name}.html`,`<head><title>${name} Dependencies</title><meta charset=\"utf-8\"></head>${full_str}`);
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