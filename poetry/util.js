const cors = "https://cors-anywhere.com/"

//utility function to replace all instances of toReplace with replaceWith in the orig string.
function replaceAll(orig,toReplace,replaceWith){
  return orig.replace(new RegExp(toReplace, 'g'), replaceWith);
}

/**
  * Removes the bot tag from the message
  * @param {string} str: string to process
  * @param {string} id: id to remove
  */
 function eraseBotTag(str,id){
    str = replaceAll(str,"<@" + id + ">","");
    str = replaceAll(str,"<@!" + id + ">","");
    return str.trim();
  }

/**
 * Loads a URL and returns the raw data
 * @param {string} theUrl: URL to load
 * @returns {Promise:resolve}: raw data from the request
 * @returns {Promise:reject}: error in the request
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
        //time out after 5 seconds
        xmlHttp.timeout = 5000;
        xmlHttp.onerror = reject;
        xmlHttp.ontimeout = reject;
        xmlHttp.send(null);
    });
}


/**
 * Loads a URL and returns a JSDOM object
 * @param {string} url: URL to fetch
 */
function urlToDOM(url){
  return new Promise(async function(resolve,reject){
      try{
      var data = await httpGetAsync(`${cors}/${url}`);
      }
      catch(e){reject(e)}
      //convert to a DOM
      let documentClone = document.cloneNode(true); 
      documentClone.firstChild.innerHTML = data;
      resolve(documentClone);
  });
}

/**
 * Replaces tabs, newlines, or repeated spaces with a single space
 * @param {string} text Text to process
 * @returns {string} Text with all whitespace characters converted to a single space
 */
function removeRecurrentWhitespace(text){
  return text.replace(/  +|\t|\n/g,' ').replace(/  +/g, ' ').trim();
}


/**
 * Replaces tabs and repeated spaces with a single space
 * Replaces repeated newlines with a single newline
 * @param {string} text Text to process
 * @returns {string} 
 */
function fixDuplicatedWhitespace(text){
  return text.replace(/  +|\t+/g,' ').replace(/\n+/g,'\n').replace(/  +/g, ' ').trim();
}

/**
 * Returns a random element of an array
 * @param {array} arr: array to get element
 */
function randomElement(arr,start=0){
  let i = getRandom(start,arr.length);
  return arr[i];
}

/**
  * Returns a random number between min and max
  * @param {number} min the low bound for random
  * @param {number} max the high bound for random
  */
function getRandom(min, max){
	return parseInt(Math.random() * (max-min) + min);
}

/** 
 * @param {string} str string to process
 * @returns {string} `str` without punctuation symbols
 */
function removePunctuation(str){
  //remove punctuation
   return str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\"']/g,"");
}

/**
 * Converts a string to Capital Case
 * @param {string} str string to capitalize
 * @returns {string} the capitalized string 
 */
function toCapitalCase(str) {
  return str.replace(/\w\S*/g, function(txt){
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

/**
 * Executes a promise with a timeout
 * @param {number} ms Amount of time to wait for the promise
 * @param {Promise} promise 
 */
function asyncTimeout(ms,promise){
  // Create a promise that rejects in `ms` milliseconds
  let timeout = new Promise(function(resolve, reject){
    let id = setTimeout(() => {
      clearTimeout(id);
      reject('Timed out in '+ ms + 'ms.')
    }, ms);
  });

  // Returns a race between timeout and the passed promise
  return Promise.race([promise,timeout]);
}


/**
 * Returns the URLs from a google search result
 * @param {string} question: question to search google
 * @returns {Promise<string[]>}: array of strings containing the URLs
 */
function getURLS(question){
  return new Promise(async function(resolve,reject){
      //load the URL
      const url = "https://google.com/search?q="+question;
      let dom = await urlToDOM(url);       
      //get the green <a> elements displayed on the page
      const classname = 'kCrYT'
      let elements = dom.window.document.getElementsByClassName(classname)
      
      //extract just the URL
      let urls = [];
      for (let element of elements){
          try{
              //get the Href component
              let url = element.getElementsByTagName('a')[0].href;
              url = url.substring(7,url.indexOf("&sa"));
              urls.push(url);
          }catch(e){}
      } 
      resolve(urls);
  });
}