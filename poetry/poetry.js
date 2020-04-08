
//add a string method for capitalizing the first letter
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1)
  }
  

//webpage data cache, to avoid loading the same URL multiple times
//structure: {"url":[model,size,last_access_time]}
let cache = {}; 
const max_cache_size = 50000000;
let current_cache_size = 0;

/**
 * Generates a poem using text on a webpage
 * @param {string} url webpage to use as a model for how to write
 * @returns {string} the resulting poem
 */
async function poem(url,minlines,maxlines,max_tries=10){
    let model;
    //does the cache already have this url loaded?
    if (cache.hasOwnProperty(url)){
        model = cache[url][0];

        //update the last access time
        cache[url][2] = Date.now();
    }
    else{
        //Load the contents of the webpage, get Article
        let dom = await urlToDOM(url);

        let article = new Readability(dom).parse();

        //Train the brain (single word mode, forward only)  
        model = makeModel(article.textContent);
        addToCache(url,model,article.textContent.length);
    }

    //Select a starting word
    let startword = randomElement(Object.keys(model));
    //Generate max 7 word lines, each pair of lines begins with the last word of the previous line (max 4 pairs / 8 lines)
    let title = toCapitalCase(from(startword,model,3));
    let poem = ['<b>"',title,'\"<b<br><br>'];
    let numLines = getRandom(minlines,maxlines);
    let prevLine = title.split(' ');
    for (let i = 0; i < numLines; i++){
        let line = "";
        for (let i = 0; i < max_tries && line == ""; i++){
            line = removeRecurrentWhitespace(from(startword,model, getRandom(3,12))).capitalize();
            startword = randomElement(prevLine);
        }
        if (line == ""){break;};
        poem.push(['<i>',line,'</i>'].join(''));
        poem.push('<br>');
        prevLine = prevLine.concat(line.split(' '));
        startword = randomElement(prevLine);
    }
    //join the poem array, and replace duplicate newlines with a single newline
    return poem.join(' ');
}

/**
 * Forward-generates the end of a sentence
 * @param {string} start the tokens representing the beginning of the sentence
 * @param {object} model the word model to use
 * @param {number} maxWords The maximum number of tokens before stopping early (default = 15)
 * @returns the end of the sentence beginning with `start`, excluding `start`.
 */
function from(start,model,maxWords=7){
    let sentence = [];
    let i = 0;

    let next = start;
    while (i < maxWords){
        //get the set
        next = nextWord(next, model);
        if (next == undefined){
            break;
        }

        //check for ending punctuation
        function endPos(str){
            const endChars = ['.','!','?','\n'];
            for (let char of endChars){
                let pos = str.indexOf(char);
                if (pos >= 0){
                    return pos;
                }
            }
            return -1;
        }

        //should the sentence end here?
        let pos = endPos(next);
        if (pos >= 0){
            next = next.substring(0,pos);
            i = maxWords;
        }

        //concatenate
        sentence.push(next);

        i++;
    }
    return sentence.join(' ');
}

/**
 * Gets the next 'word' for the current word, using the brain.
 * @param {string} word Word to use
 * @param {countedSet.countedSet} dictionary countedSet containing the lookups and weights for the following words
 * @returns {string} the next token for `word`
 */
function nextWord(word, dictionary){
    let set = dictionary[word];
    if (set == undefined){
        return undefined;
    }
    
    //get the max count
    let entries = set.total();
    //get random
    let weights = [];
    let items = Object.keys(set.data);
    for (item of items){
        weights.push(set.data[item] / entries);
    }

    return items[weightedRandom(weights)];
}

/**
 * Generates a key-value pair model 
 * For best results, pass the data as lowercase
 * @param {string} data raw text to train the model
 * @returns {object} key-value pairs: values represent the word that follows the keys
 */
function makeModel(data){
    let model = {};

    data = fixDuplicatedWhitespace(data).toLowerCase();

     /**
     * Trains the brain using a passed array (abstracted as a function so it can be easily called repeatedly to train the brain multiple ways)
     * @param {string[]} dataArr Array to use. The system uses the previous and next index to create the patterns
     */
    function train(dataArr){
        for (let i = 1; i < dataArr.length-1; i++){
            let token = dataArr[i];

            //add forward item
            if (!model.hasOwnProperty(token)){
                model[token] = new countedSet();
            }
            model[token].add(dataArr[i+1]);
        }
    }

     //single token training
     {
        let dataArrSingle = data.split(' ');
        train(dataArrSingle);
    }
    return model;
}

/**
 * Adds a webpage to the cache. If the cache exceeds max_cache_size, purge the cache of old entries.
 * @param {string} url 
 * @param {object} model
 * @param {number} size
 */
function addToCache(url,model,size){
    cache[url] = [model,size,Date.now()];
    current_cache_size += size;

    //check if it needs to clear the cache
    if (current_cache_size > max_cache_size){
        purgeCache();
    }
}

/**
 * Removes the oldest entries from the cache, until the cache is below the acceptable limit
 */
function purgeCache(){
    while (current_cache_size > max_cache_size){
        let keys = Object.keys(cache);
        let oldest = keys[0];
        //iterate looking for the oldest (last accessed) key in the cache
        for (let i = 1; i < keys.length; i++){
            let key = keys[i];
            let time = cache[key][2];
            if (time < cache[oldest][2]){
                oldest = key;
            }
        }
        current_cache_size -= cache[oldest][1];
        delete cache[oldest];
    }
}