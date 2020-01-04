/*
This file contains useful functions commonly shared between my webapps

Author: Ravbug
*/

/*
Copies text from an object whose .value property is plain text to the clipboard.
On success, calls the method copySuccess(text) which you must implement to recieve what was copied
On failure, calls the method copyFailed()

-- Parameters --
	object - an object with a .value property containing plain text (such as a textarea)

-- Returns --
	nil

*/

var startingURL = document.URL.substring(0,document.URL.indexOf('?'));

function copy(object)
{

	object.select();
	object.setSelectionRange(0,object.value.length);
	var textToCopy=object.value;
	var success = document.execCommand('copy');

	if (!success){
    copyFailed();
	}
	else{
		if (textToCopy.length > 100){
			textToCopy = textToCopy.substring(0,50) + " [...] " + textToCopy.substring(textToCopy.length-50);
		}
    copySuccess(textToCopy);
	}
	//window.getSelection().removeAllRanges();
}

/*
A newer version of the copy routine but using callbacks instead of forcing defining of methods
*/
function copy2(object,callback_success,callback_failed){
	object.select();
	object.setSelectionRange(0,object.value.length);
	var textToCopy=object.value;
	var success = document.execCommand('copy');

	if (!success){
    callback_failed(textToCopy);
	}
	else{
		if (textToCopy.length > 100){
			textToCopy = textToCopy.substring(0,50) + " [...] " + textToCopy.substring(textToCopy.length-50);
		}
    callback_success(textToCopy);
	}
	//window.getSelection().removeAllRanges();
}

/*
Writes the arguments to the URL without reloading the page, to allow for link sharing

When I make a proper URL query string encoder I'll make another method named 'makeQstring()' that takes a 2D array
-- Parameters --
	args: an array containing the data to write to the URL bar
				FORMAT: "argName=value"
								value must be encoded before passing. use encodeURIComponent(value). do not use encodeURI()!
								argName cannot have spaces or '&'. including them will not cause a crash but will screw up your data!
				example: "bar, fo o" --> ["arg=bar","arg2=fo%20o"]
*/
function writeURLArgs(args){
	var qString = "";
	for (var i = 0; i < args.length; i++){
		var argNameLoc =
		qString += args[i] + "&";
	}
	//remove last &
	qString = qString.substring(0,qString.length-1)
	window.history.pushState("", "", startingURL + "?" + qString);
}

/*
Reads the contents of the URL and extracts the Parameters
-- Returns --
	an array containing each argument, with headers
	example return: ["arg=bar","arg2=foo"]
*/
function readURLArgs(){
	var curr_url = document.URL;
	var qArgs = curr_url.substring(curr_url.indexOf('?') + 1);

	return args =  qArgs.split("&");
}

/*
Returns the value of the argument 'arg'
-- Parameters --
	arg: the argument to get the value of
-- Returns --
	the value of the argument as a string, or undefined if the argument is not present.
-- Example --
getURLArgValue("x") --> "2" (don't include the = sign)
*/
function getURLArgValue(arg){
	var args = readURLArgs()

	for (var i = 0; i < args.length; i++){
		if (args[i].includes(arg + "=")){
			return decodeURI(args[i].substring(args[i].indexOf("=") + 1));
		}
	}
	//return undefined
}

/*
Returns the ratio of the string lengths, always 0 -> 1
0 means one string has length 0
1 means strings are identical lengths
-- Parameters --
	stringA - first string
	stringB - second string
-- Returns --
	A double between 0 and 1, that is the ratio of their lengths
*/
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

//Retrieves a cookie with a specified name
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
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
* Syncronously gets the server's response to a request using theUrl
* Syncronous GET is discouraged, so unless timing matters, or the browser is really old, use httpGetAsync with a callback
* -- Parameters --
* 	theUrl: the request URL to get the response from
*/
function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

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

// Helper method to parse the title tag from the response.
function getTitle(text) {
  return text.match('<title>(.*)?</title>')[1];
}

/**
Captializes the first letter of the string str
returns the capitalized string
*/
function applySentenceCase(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
Determines if an array contains an item
-- Parameters --
		array (array): the array to search
		query (any): a value to search for (must accept == comparisons)
-- Returns --
		true if array contains query, false otherwise
*/
function arrayContains(array, query){
	for (var i = 0; i < array.length; i++){
		if (array[i] == query){
			return true;
		}
	}
	return false;
}

/* Calcuates the average of an array

*/
function getAverage(array){
	var sum = 0;
	for (var i = 0; i < array.length; i++){
		sum += array[i];
	}
	return sum / array.length;
}

/*
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

// Enable the tab character onkeypress (onkeydown) inside textarea...
// ... for a textarea that has an id="my-textarea"
function enableTab(id) {
    var el = document.getElementById(id);
    el.onkeydown = function(e) {
        if (e.keyCode === 9) { // tab was pressed

            // get caret position/selection
            var val = this.value,
                start = this.selectionStart,
                end = this.selectionEnd;

            // set textarea value to: text before caret + tab + text after caret
            this.value = val.substring(0, start) + '\t' + val.substring(end);

            // put caret at right position again
            this.selectionStart = this.selectionEnd = start + 1;

            // prevent the focus lose
            return false;

        }
    };
}

/**
 * @returns the URL arguments as a key-value dictionary
 */
function urlArgsAsDict(){
	let args = readURLArgs();
    let argdict = {}
    for (let arg of args) {
      let parts = arg.split('=');
      argdict[parts[0]] = parts[1];
	}
	return argdict;
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
