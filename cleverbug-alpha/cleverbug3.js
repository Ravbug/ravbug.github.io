
/**
 * Featureset of Engine 3.0:
 *	Google Sheets based storage, no re-polling
 * Different storage and read method
 * √ Custom username
 * √ Custom cleverbot name
 *
 *
 */

const sheets_id = "17bX4lpW5ayTfVjivtImeAQlCEouQ8Z5B4Nz-_jBrpvM";
var logsuccesses = false;

/*
	When given text, returns an apropriate answer
	-- Parameters --
		text: the string to ask the bot
		callback(returned_data_as_array): the method to call when the request has finished
		validate: whether or not to attempt to post the inputted text to the database
	-- Returns --
		an answer to text using the online database
*/

function getResponse(text,prevtext,callback,validate,failure_callback,server,uid,origString,tokensMode){
		//remove quotes
		text = text.replace(/'/g, "’");
		if (origString == undefined){origString = text;}
		//is this Math
		//replace the word equivalents with symbols
		var symbolReplace = text.toLowerCase();
		var symbolMatch = {"times":"*","plus":"+","minus":"-","divided by":"/", "divide by":"/","multiplied by":"*","multiply by":"*"}
		for (var word in symbolMatch){
			symbolReplace = replaceAll(symbolReplace,word,symbolMatch[word]);
		}
		var mathSymbols = ['+','-','*','/','=','%'];
		for (var character in mathSymbols){
			if (symbolReplace.includes(mathSymbols[character])){
				//this is math, start math pathway
				//remove non-numeric or characters
				textTemp = symbolReplace;
				var letters = "qwertyuiopasdfghjklzxcvbnm~!@#$^&_={[]}<>?,'";
				for (var letter in letters){
					textTemp = replaceAllSlow(textTemp,"" + letters.charAt(letter),'')
				}
				textTemp = textTemp.trim();

				try{
					var result = eval(textTemp);
					callback(textTemp + " = " + result)
					return false;
				}
				//fail silently and switch to normal LUT execution
				catch(error){}
				break;
			}
		}



		//asynchronous post the user's response to the database
		if (validate && prevtext != null)
			addResponse(text,prevtext,server,uid);

		//remove spaces and send to lowercase, for best matching with least spam

		var bestcompare;
		var col = "B";
		//fallback token search mode
		if (tokensMode){
			//split into an array
			var array = text.split(' ');
			var unsorted = array.slice(0,array.length);
			//sort the array if necessary
			if (array.length > 0){
				array.sort(function(a, b){
					// ASC  -> a.length - b.length
					// DESC -> b.length - a.length
					return b.length - a.length;
				});
			}
			//get the longest word (at 0)
			bestcompare = array[0];

			//find the word nearby(to get two words to get a better match)
			var idx = unsorted.indexOf(bestcompare);
			var word2;
			if (idx != unsorted.length-1){
				word2 = unsorted[idx+1];
				bestcompare += word2;
			}
			else if (idx != 0){
				word2 = unsorted[idx-1];
				bestcompare += word2;
			}

			//remove the longest from the array
			if (text != "" && bestcompare != ""){
				text = replaceAllSlow(text,bestcompare,"")
			}
		}
		//standard search
		else{
			bestcompare = replaceAll(text," ","").toLowerCase();
		}
		//search the DB for that message
		var query = "SELECT * WHERE " + col + " contains '" + encodeURIComponent(bestcompare) + "'";

		var answer = httpGetAsync("https://docs.google.com/spreadsheets/d/"+ sheets_id + "/gviz/tq?tq=" + query,
			function(string){
				//make it json friendly
				string = string.substring(string.indexOf('(')+1,string.length-2);
				//parse it to a JavaScript Object
				var obj = JSON.parse(string);
					var numRows = obj.table.rows.length;
					//if an answer could be found, emit it
					if (numRows > 0){
						var row = getRandom(0,numRows);
						var answer_prelim = (obj.table.rows[row].c[2].v);
							callback(applySentenceCase(decodeURIComponent(answer_prelim)));
					}
					else{
						var lastIndex = text.lastIndexOf(" ");
						text = text.substring(0,lastIndex);

						//has it lost too much of the original string?
						if (!tokensMode && getStringRatio(text,origString) < 0.3){
							tokensMode = true;
							text = origString
						}
						getResponse(text,null,callback,false,failure_callback,undefined, undefined, origString,tokensMode);
					}

			},failure_callback);
		return false;
}

/**
Posts the user's response to the database
Note (12/15/2019) response adding from the website version has been disabled. 
*/
function addResponse(text,prevtext,server,uid){
	//the server recieves this text and decides whether or not to post it
	//httpGetAsync("https://ravbuganimations.com/cleverbot_respond.php?str="+encodeURIComponent(text) + "&prevstr=" + encodeURIComponent(prevtext) + "&serv=" + server + "&uid=" + uid,function(string){if (logsuccesses){console.log(string);}});
}
/*
	Supplies a random cell of the database
*/
function thinkForMe(callback,failure_callback){
	getResponse("",null,function(response){
		callback(response);
	},false,failure_callback)
	//get the id of the last row
	//call getRandom(1,row)
	//query the database with that row
	//return the data col of that row
}


//copy-pasted from utilities.js for the node.js program
/**
* Fetches the result from a server request in the background (Encouraged)
* -- Parameters --
* 	theUrl: the request URL to process
* 	callback: called upon completion of the request (or fail)
*/
function httpGetAsync(theUrl, callback,callbackError)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous
		xmlHttp.onerror = callbackError;
    xmlHttp.send(null);
}

/**
Returns a random number between min and max
Min: the low bound for random
Max: the high bound for random
*/
function getRandom(min, max){
	return parseInt(Math.random() * (max-min) + min);
}
/**
Captializes the first letter of the string str
returns the capitalized string
*/
function applySentenceCase(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function replaceAll(orig,toReplace,replaceWith){
        return orig.replace(new RegExp(toReplace, 'g'), replaceWith);
}

//uses loops instead of regex
function replaceAllSlow(orig,toReplace,replaceWith){
	if (toReplace == ""){ return orig;};
	var newString = "";
	for (var i = 0; i < orig.length - toReplace.length+2; i++){
		var temp = orig.slice(i,i+toReplace.length);
		if (temp == toReplace){
			newString += replaceWith;
			i+= toReplace.length-1	;
		}
		else{
			newString += orig.charAt(i);
		}
	}
	return newString;
}


function getStringRatio(stringA, stringB){
	var strings = orderStringsByLength(stringA,stringB);
return strings[0].length / strings[1].length;
}


/*
 Orders strings by length
*/
function orderStringsByLength(stringA, stringB){
	if (stringA.length > stringB.length){
		larger = stringA;
		smaller = stringB;
	}
	else{
		larger = stringB;
		smaller = stringA;
	}

	return [smaller,larger];
}
