let searchBar = document.getElementById('input');
let output = document.getElementById('output');

async function search(){
    output.innerHTML = "Loading..."
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

const cors = "https://corsanywhere.herokuapp.com"

/**
 * Search DuckDuckGo Instant Answers API
 * @param {string} query the string to search for
 */
async function tryDuckDuckGo(query){
    let queryurl = `${cors}/https://api.duckduckgo.com/?q=${spaceToPlus(searchBar.value)}&format=json`
    let result = JSON.parse(await httpGetPromise(queryurl));

    //if there's an AbstractText
    if (result['AbstractText'] != ""){
        return result['AbstractText'] + "<br><br>" + `<a href="${result['AbstractURL']}">${result['AbstractURL']}</a>`
    }
    //read related topics
    let answers = [`Interpretations for "${query}" may include:<br>`];
    let foundDetail = undefined;
    if (result['RelatedTopics'].length > 0){

        async function ddAttempt(content){
            if(foundDetail == undefined){
                let dummy = document.createElement('div');
                dummy.innerHTML = content;
                let newQuery = dummy.querySelector('a').innerText;
                dummy.remove();
                let res = await httpGetPromise(`${cors}/https://api.duckduckgo.com/?q=${spaceToPlus(newQuery)}&format=json`);
                res = JSON.parse(res);
                if(res['AbstractText'] != ""){
                    foundDetail = res['AbstractText'] + "<br><br>" + `<a href="${result['AbstractURL']}">${result['AbstractURL']}</a>`;
                }
            }
        }

        for (let topic of result['RelatedTopics']){
            //sub-topics
            if (topic.hasOwnProperty('Topics')){
                answers.push(`<details><summary>${topic['Name']}</summary>`)
                for(let subtopic of topic['Topics']){
                    answers.push(subtopic['Result']);
                    await ddAttempt(subtopic['Result']);
                }
                answers.push(`</details>`);
            }
            else{
                answers.push(topic['Result']);
                await ddAttempt(topic['Result']);
            }
        }
        if (foundDetail){
            answers.splice(0,1);
            return `${foundDetail}<details><summary>More matches</summary>${answers.join('<br>')}</details>`
        }
        else{
            return answers.join('<br>');
        }
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
    let queryurl=`https://en.wikipedia.org/w/api.php?action=query&list=search&origin=*&srsearch=${query}&utf8=&format=json&srlimit=5`;
    let result = JSON.parse(await httpGetPromise(queryurl));

    //interested in the query->search part
    let pages = result['query']['search'];

    //now get more text from each page
    for(let page of pages){
        let pageData = JSON.parse(await httpGetPromise(`https://en.wikipedia.org/w/api.php?action=query&origin=*&prop=extracts&exsentences=6&exlimit=1&titles=${page['title'].replace(/ /gm,'_')}&explaintext=1&formatversion=2&format=json&exsectionformat=plain`));
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