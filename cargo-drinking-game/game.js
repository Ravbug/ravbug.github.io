 /**
Get data from remote resource
*/
const cache = {}
async function httpget(url){
    // have we cached this?
    let temp = undefined;
    if (temp = cache[url]){
        return temp;
    }
    try{
        await fetch(url).then(response => response.json()).then(data=>{temp=data});
    }
    catch(e){
        return undefined;
    }
    cache[url] = temp
    return temp;
}
let count_optional = false
const pkg_cache = {}
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

    const packagedetails = await httpget(`https://crates.io/api/v1/crates/${package_name}`)
    if (packagedetails["errors"]){
        //error occurred
        console.error(`No package found for ${package_name}`)
    }
    else{
        // get basic package stats
        details["name"] = package_name
        details["desc"] = packagedetails["crate"]["description"]
        details["dls"] = packagedetails["crate"]["recent_downloads"]

        if (version != undefined){
            // find the size of the relevant version
            for(const ver of packagedetails["versions"]){
                if (ver["num"] == version){
                    details["size"] = ver["crate_size"]
                    break;
                }
            }
        }
        else{
            // default to latest
            details["size"] = packagedetails["versions"][0]["crate_size"]
        }
        pkg_cache[name_for_pkg(package_name,version)] = details
        version = packagedetails["versions"][0]["num"]

        details["version"] = version

        //output progress
        totalpackages++;
        document.getElementById("output").innerHTML = `Analyzed ${totalpackages} dependencies, skipped ${optional_skipped} optional dependencies...`;

        // determine the dependencies for this package
        const deps = await httpget(`https://crates.io/api/v1/crates/${package_name}/${version}/dependencies`)
        details["deps"] = []
        for(const dep of deps["dependencies"]){
            if (!dep["optional"] || count_optional){
                // don't count dev dependencies
                if (dep["kind"] == "normal"){
                    const dep_data = await interrogate_package(dep["crate_id"],dep["req"].startsWith('^') ? dep["req"] : undefined);
                    if (dep_data != undefined){
                        details["deps"].push(dep_data)
                    }
                }
            }
            else{
                optional_skipped++
            }
        }

        // determine number of users for this package
        const pkg_users = await httpget(`https://crates.io/api/v1/crates/${package_name}/reverse_dependencies?per_page=1`)
        details["n_users"] = pkg_users["meta"]["total"]
      
    }

    return details
}

let totalpackages = 0
let optional_skipped = 0
async function intoxicate(in_name){
    totalpackages = 0
    optional_skipped = 0
    // query cargo to determine if a package exists
    const package = await interrogate_package(in_name,undefined,true)

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
        final_html.push(`<a href="https://crates.io/crates/${pkg["name"]}/${pkg["version"]}">${pkg["name"]} v${pkg["version"]}</a><br>${pkg["desc"]}`);

        // is trivial? 
        final_html.push(`<br> Is Trivial? Size: ${pkg["size"]} < 200,000? `)
        const trivial = doTest(pkg["size"] == undefined || pkg["size"] < 200000)

        // is overrated?
        final_html.push(`<br> Is Overrated? Trivial && Recent downloads: ${pkg["dls"]} > 1000? `)
        const overrated = doTest(trivial && pkg["dls"] > 1000)

        // Is pointless?
        final_html.push(`<br> Is Overused? Small with high usage: ${pkg["n_users"]} > 50 && trivial? `)
        const pointless = doTest(pkg["n_users"] > 50 && trivial)

        // recurse dependencies
        for(const dep of pkg["deps"]){
            final_html.push(`<br> Unique dependencies (${total_deps_for(pkg)}): <blockquote>`)
            gen_package(dep)
            final_html.push(`</blockquote>`)
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