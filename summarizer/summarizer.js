self.importScripts('../countedSet.js');

onmessage = e => {
    let summarized = summarize(e.data.text,e.data.weight);
    postMessage(summarized);
}

const stopWords = ["a","i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"];


/**
 * Summarizes text
 * @param {string} text: the text to summarize
 * @returns {string}: the summarized text
 * @param {number} weight the additional weight to apply when determining sentence threshold
 */
function summarize(text, weight = 2){
    text=text.replace(/  +|\t/g,' ').replace(/\n/g,'. ');
    let table = frequencyTable(removeStopwords(text));
    let sentences = text.split('. ');
    let scores = {};
    //determine the scores of each sentence
    for (sentence of sentences){
        scores[sentence] = scoreSentence(sentence,table);
    }
    //determine the average score
    let keys = Object.keys(scores);
    let avg = 0;
    for (let key of keys){
        avg += scores[key];
    }
    avg /= keys.length;
    avg *= weight;

    //add all sentences above the average to the summary
    let summary = [];
    for (let key of keys){
        let score = scores[key];
        if (score >= avg){
            summary.push(key);
        }
    }
    return summary.join('. ');
}

/**
 * Returns sentences sorted by importance
 * @param {string} text String to find importance 
 * @returns {string[]} Array of strings found in `text` sorted by importance
 */
function importance(text){
    text=text.replace(/  +|\t/g,' ').replace(/\n/g,'. ');
    let table = frequencyTable(removeStopwords(text));
    let sentences = text.split('. ');
    let scores = {};
    //determine the scores of each sentence
    for (sentence of sentences){
        scores[sentence] = scoreSentence(sentence,table);
    }
    let sorted = Object.keys(scores);
    sorted.sort(function(a,b){
        return scores[b]-scores[a];
    });

    return sorted.slice(0,5);
}

/**
 * Removes stop words from a string
 * @param {string} text: text to remove stopwords from
 * @returns {string}: text without stop words
 */
function removeStopwords(text){
    let arr = text.split(' ');
    //for each stop word
    for (let word of stopWords){
        //for each word in the text
        for (let i = 0; i < arr.length; i++){
            if (word.toLowerCase() == arr[i].toLowerCase()){
                arr.splice(i,1);
                i--;
            }
        }
    }
    return arr.join(' ');
}

/**
 * Generates a frequency table out of text
 * It is recommended to remove stop words before using this.
 * @param {string} text: text to build table for
 * @returns {Object}: object with structure {word: number, word: number}
 */
function frequencyTable(text){
    let set = new countedSet();
    let arr = text.replace(/[^A-Za-z ]+/g,"").split(' ');
    for (let word of arr){
        if (word.length > 2){
            set.add(word.toLowerCase());
        }
    }
    return set;
}

/**
 * Generates a score to a sentence
 * @param {string} text: sentence to score
 * @param {countedSet} freqTable: counted set to use as a frequency table
 * @returns {number}: score for the sentence
 */
function scoreSentence(text,freqTable){
    //scores a sentence by adding up all the scores of the words in the sentence
    //as defined by the frequency table
    let arr = text.split(' ');
    let rank = 0;
    for (let word of arr){
        let add = freqTable.count(word.toLowerCase());
        if (add != undefined){
            rank += add;
        }
    }
    return rank;
}