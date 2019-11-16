/**
 * Loads a resource as plain text
 * @param {string} theUrl the URL to the resource to load
 * @returns {Promise<string>} Resolves with the text on success, rejects on failure
 */
function httpGetAsync(theUrl)
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

/**
Get valid RateMyProfessor URLs from Google
@param {string[]} keywords array of keywords to google search
@returns {Promise<string[]>} array of valid rate my professors URLs
*/
async function loadURLs(keywords){
    return new Promise(async function (resolve,reject){
        //prepare keywords
        keywords = keywords.join('+').replace(/ /g,'+').toLowerCase();

        //load google results
        let str = cors+"https://www.google.com/search?q="+keywords+"&num=50";
        let res = await httpGetAsync(str).catch(()=>{alert("Could not load")});
        let dummy = document.createElement('html');
        dummy.innerHTML = res;

        let usable = [];
        {
                //get all the links on the page
                let links = dummy.getElementsByTagName('a');
                dummy.remove();
                for(let link of links){
                    if (!link.href.includes("webcache.google") && link.href.includes("ratemyprofessor")){
                        usable.push(link.href);
                    }
                }
        }
        resolve(usable);
    });
}

/**
Get statistics about a professor by scraping the RateMyProfessors page
@param {string} url the URL to the rate my professors page
@param {string} school the full name of the school for validation
@param {string} classname the name of the class for validation
@returns {} undefined if the page is bad, or a dictionary with stats
*/
async function processURL(url,school,classname){
    return new Promise(async function(resolve,reject){
        let res = await httpGetAsync(url).catch(()=>{alert("Could not load")});
        let dummy = document.createElement('html');
        dummy.innerHTML = res;

        //sanity check: correct school?
        try{
            let profTitle = dummy.getElementsByClassName('result-title')[0].innerHTML;
            if (!profTitle.includes(school)){
                resolve()
                return;
            }
        }
        catch(e){resolve();return;}

        //sanity check: correct classes listed?
        let classes = dummy.getElementsByClassName('class');
        let correct = 0;
        for (let cl of classes){
            // the value is 2 elements deep
            let v = cl.firstElementChild.firstElementChild;
            if (v && v.innerHTML.toLowerCase().includes(classname.toLowerCase())){
                correct++;
            }
        }
        if (correct == 0){
            resolve()
            return;
        }

        //get the name
        let summary = {};
        let name = dummy.getElementsByClassName('profname')[0];
        name = name.innerText.trim().split(' ');
        name = name[0] + " " + name[name.length-1];
        summary["Name"] = name;

        //get the rating info
        let breakdown = dummy.getElementsByClassName('left-breakdown')[0];
        let scores = breakdown.querySelectorAll(".grade");
        summary["Grade"] = parseFloat(scores[0].innerHTML);
        summary["Difficulty"] = parseFloat(scores[2].innerHTML);

        //get the number of ratings
        let nratings = dummy.getElementsByClassName("table-toggle rating-count active")[0];
        summary["Ratings"] = parseInt(nratings.innerHTML);

        //get the review dates, find the most recent
        let dates = dummy.getElementsByClassName("date")
        let newest = new Date(0);
        for (let date of dates){
            let d = new Date(date.innerText);

            if (d > newest){
                newest = d;
            }
        }
        summary["Most_Recent_Review"] = newest.toLocaleDateString()

        //clean up
        dummy.remove()
        resolve(summary);
    });
}
