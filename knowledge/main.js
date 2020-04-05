let searchBar = document.getElementById('input');
let output = document.getElementById('output');

async function search(){
    //try different sources
    let answer = await tryDuckDuckGo(searchBar.value);
    if (answer){
        output.innerHTML = answer;
    }
    else{
        answer = await tryWikipedia(searchBar.value);
        output.innerHTML = answer;
    }
}

/**
 * Search DuckDuckGo Instant Answers API
 * @param {string} query the string to search for
 */
async function tryDuckDuckGo(query){
    let queryurl = `https://api.duckduckgo.com/?q=${spaceToPlus(searchBar.value)}&format=json`
    let result = JSON.parse(await httpGetPromise(queryurl));

    //if there's an AbstractText
    if (result['AbstractText'] != ""){
        return result['AbstractText'] + "<br><br>" + result['AbstractURL']
    }
    //read related topics
    let answers = [`Interpretations for "${query}" may include:<br>`];
    if (result['RelatedTopics'].length > 0){
        for (let topic of result['RelatedTopics']){
            //sub-topics
            if (topic.hasOwnProperty('Topics')){
                console.log(topic);
                answers.push(`<details><summary>${topic['Name']}</summary>`)
                for(let subtopic of topic['Topics']){
                    answers.push(subtopic['Result']);
                }
                answers.push(`</details>`);
            }
            else{
                answers.push(topic['Result']);
            }
        }
        return answers.join('<br>');
    }
    return undefined;
}

/**
 * Searches Wikipedia's /w/api.php 
 * @param {string} query the string to search for
 */
async function tryWikipedia(query){
    let content = [`"${query}" may refer to: <br><br>`];

    query = encodeURIComponent(query);
    let queryurl=`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${query}&utf8=&format=json&srlimit=5`;
    let result = JSON.parse(await httpGetPromise(queryurl));

    //interested in the query->search part
    let pages = result['query']['search'];

    //now get more text from each page
    for(let page of pages){
        let pageData = JSON.parse(await httpGetPromise(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exsentences=6&exlimit=1&titles=${page['title'].replace(/ /gm,'_')}&explaintext=1&formatversion=2&format=json&exsectionformat=plain`));
        content.push(`<a href='${wpTitleToURL(page['title'])}'>${page['title']}</a><br>${pageData['query']['pages'][0]['extract']}`);
    }
    return content.join('<hr>')
}

/**
 * Loads a resource as plain text
 * @param {string} theUrl the URL to the resource to load
 * @returns {Promise<string>} Resolves with the text on success, rejects on failure
 */
function httpGetPromise(theUrl)
{
    return new Promise(function(resolve,reject){
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                resolve(xmlHttp.responseText);
        }
        xmlHttp.open("GET", theUrl, true); // true for asynchronous
            xmlHttp.onerror = reject;
        //xmlHttp.setRequestHeader("origin", true);
        xmlHttp.send(null);
    });
}

function keyhandle(){
    if(event.keyCode == 13){
        search();
    }
}

function spaceToPlus(string){
    return string.replace(/ /gm,'+')
}

function wpTitleToURL(title){
    return `https://en.wikipedia.org/wiki/${title.replace(/ /gm,'_')}`
}