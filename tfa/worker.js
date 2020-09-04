//load the symbol table
self.importScripts("cmu-symbols.js");
self.importScripts("cmu-symbols-cr.js");
let symlist = [symbols,symbolscr];

let dict = {};
const punct = new Set(['.',',','!','?',':',':',')',']','"',"'"]);

const re=new RegExp(     // tokenizer
    '\\s*'+            // discard possible leading whitespace
    '('+               // start capture group
      '\\.{3}'+            // ellipsis (must appear before punct)
    '|'+               // alternator
      '\\w+\\-\\w+'+       // hyphenated words (must appear before punct)
    '|'+               // alternator
      '\\w+\'(?:\\w+)?'+   // compound words (must appear before punct)
    '|'+               // alternator
      '\\w+'+              // other words
    '|'+               // alternator
      '['+['\\[', '\\!', '\\"', '\\#', '\\$', '\\%', '\\&', '\\\'', '\\(', '\\)', '\\*', '\\,', '\\,', '\\\\', '\\-', '\\.', '\\/', '\\:', '\\;', '\\<', '\\=', '\\>', '\\?', '\\@', '\\[', '\\]', '\\^', '\\_', '\\`', '\\{', '\\|', '\\}', '\\~', '\\]'].join('')+']'+        // punct
    ')'                // end capture group
  );


//parse the dictionary
{
    //import the dictionary as a string
    self.importScripts("cmudict-07b-mod.js");
    let temp = dictstr.split('\n');
    for(let line of temp){
        //ignore comments
        if (line.startsWith(';;;') || line.length == 0){continue;}
        
        //store in the dictionary
        let parts = line.split('  ');

        //alternate spelling overrider
        if (parts[0].includes('(1)') && parts[0]=='A(1)'){
            parts[0] = parts[0].substring(0,parts[0].indexOf('('));
        }

        dict[parts[0]] = parts[1].split(' ');
    }
    //linebreaks
}

//webworker recieve data
onmessage = function(e){
    let translation = [];
    let success = [];
    //replace newlines
    //split sent string
    let arr = e.data[0].replace(/\n/gm,'<br>').toUpperCase().split(re);
    for (let word of arr){
        //replace smart quotes
        word = word.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');
        //skip empty
        if (word.length == 0){continue;};
        //look up token
        let pronounciation = dict[word];
        if (pronounciation != undefined){
            //convert the symbols to TFA
            let translated = [];
            for (let i in pronounciation){
                translated[i] = symlist[e.data[1]][pronounciation[i]];
            }
            //add to the dictionary
            translation.push(" " + translated.join(''));
            success.push(true);
        }
        else{
            //is it sentence punctuation?
            if (punct.has(word)){
              translation.push(word);
              success.push(true);
            }
            else{
              translation.push(" " + word);
              success.push(false);
            }
        }  
    }
    //return dictionary, where each token has true if it was translated or false if it was not
    this.postMessage([translation,success]);
}