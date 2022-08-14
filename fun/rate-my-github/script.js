async function httpget(url){
    let data;
    await fetch(url).then(value =>{
        if (value.ok){
            return value.json()
        }
        else{
            throw {reason:value, code:value.status}
        }
    } ).then(json => data = json)
    return data;
}

async function calculate(user){
    // get the user's repos
    const stats = {
        creatorPts : 0,
        contributorPts : 0,
        reviewerPts : 0,
        vampirePts : 0,
    }
    let analyzed = 0;
    output.innerHTML = "Loading..."
    /**
     * 
     * @param {stats} stats 
     */
    function normalize(stats){
        const total = stats.creatorPts + stats.contributorPts + stats.vampirePts + stats.reviewerPts
        stats.creatorPts /= total;
        stats.contributorPts /= total;
        stats.vampirePts /= total;
        stats.reviewerPts /= total;
    }
    let outstr = ""
    try{
        const repos = await httpget(`https://api.github.com/users/${user}/repos?per_page=100`)

        let nRepos = repos.length

        const forks = [];


        // forks vs original code
        for(const repo of repos){
            if (repo.fork){
                // do these later, this could become a lot of API requests
                forks.push(repo)
            }
            else{
                // account owns the repo, +1 creator points
                stats.creatorPts++;
                analyzed ++;
            }
        }
        output.innerHTML = `Analyzed ${analyzed} repositories...`

        // get number of PRs
        const prs = await httpget(`https://api.github.com/search/issues?q=+type:pr+user:${user}`)
        stats.contributorPts += prs.total_count;

        // get number of comments
        const comments = await httpget(`https://api.github.com/search/issues?q=+type:comment+user:${user}`)
        stats.reviewerPts += comments.total_count;

        // now process forks
        for(const fork of forks){
            const data = await httpget(`https://api.github.com/repos/${fork["full_name"]}/contributors?per_page=100`)
            let found = false
             // has the user contributed to the fork? if no, add a vampire point
            for(const contributor of data){
                if (contributor["login"] == user && contributor["type"] == "User"){
                    stats.contributorPts++;
                    found = true;
                    break;
                }
            }
            if (!found){
                stats.vampirePts++;
            }
            analyzed++
            output.innerHTML = `Analyzed ${analyzed} repositories...`
        }
    }
    catch(e){
        if (e.code == 403){
            // API authentication error
            outstr += "API rate limit reached - Here's what we found so far<br>"
        }
        else if (e.code == 404){
            // unkown user error
            output.innerHTML = `No user by ${user} found`
            return;
        } 
    }

    // normalize
    normalize(stats)

    // now find the highest percentage item

    const maxKey = Object.keys(stats).reduce((a, b) => stats[a] > stats[b] ? a : b);
    outstr += `Based on analysis of ${analyzed} repositories, your GitHub Class is: <b>`


    switch(maxKey){
        case "creatorPts":
            outstr += printCreator()
            break;
        case "contributorPts":
            outstr += printContributor()
            break;
        case "reviewerPts":
            outstr += printReviewer()
            break;
        case "vampirePts":
            outstr += printVampire()
            break;
    }

    const config = {
        responsive: true
    } 
    Plotly.newPlot( 
        "chart", 
        [
        {
            x: ["Creator","Contributor","Reviewer","Vampire"],
            y: Array.from(Object.values(stats)),
            type: 'bar' 
        }
        ], 
        {
            title: `${user}'s Profile Attributes`,
        },
        config
    );
    output.innerHTML = outstr
}

function printCreator(){
    return `Creator</b><br>
    You create new projects and you share them with the world.
    `
}

function printContributor(){
    return `Contributor</b><br>
    You prefer to help others with their projects.
    `
}

function printReviewer(){
    return `Reviewer</b><br>
    You help ensure quality by judging all code that passes by you.
    `
}

function printVampire(){
    return `Vampire</b><br>
    Stop boosting your profile with other people's code. If you want a bookmark, use the star feature.
    `
}