/**
 * The main processing of the TextTransformer program
 *
 * Features:
	 * capitalize a letter √
	 * lowercase a letter √
	 * swap letters  √
	 * insert letter √
	 * replace letter
	 * duplicate lettes √
	 * delete letters  √
	 * capitalize every word √
	 * lowercase every word √
 *
 * Settings
	 * Live Update √
	 * Case change chance √
	 * swap chance  √
	 * insert chance
	 * 		priortize common mistakes
	 * duplicate chance √
	 * 		prioritize common mistakes
	 * delete chance √
	 * switch chance √
	 *
 *
 */


function transform(text){
	var results = "";
	var caseChance= document.getElementById("caseChance");
	var dupeChance = document.getElementById("duplicateChance");
	var deleteChance = document.getElementById("deleteChance");
	var swapChance = document.getElementById("swapChance");
	var insertChance = document.getElementById("insertChance");
	var replaceChance = document.getElementById("replaceChance");
	var bChance = document.getElementById("bChance");
	var bMin = document.getElementById("bMin");



	//Initialize variables corresponding to UI elements to avoid typing document.getElement... repeatedly
	for (i = 0; i < text.length; i++){
		var char = text.charAt(i);

		//insert the character first, then try manipulating
		results += char;
		var chance = getRandom(0,100);
		//case switch
		if (chance <= caseChance.value){
			results = results.substring(0,results.length-1) + changeCase(char);
		}
		//duplicate letter
		chance = getRandom(0,100);
		if (chance <= dupeChance.value){
			results = results.substring(0,results.length-1) + duplicateChar(char);
		}

		//remove a letter
		chance = getRandom(0,100);
		if (chance <= deleteChance.value){
			results = results.substring(0,results.length-1); //does not re-add letter, removes it instead
		}

		//swap this letter with the next one
		chance = getRandom(0,100);
		if (chance <= swapChance.value){
			results = results.substring(0,results.length-2) + text.charAt(i+1) + char;
		}
		chance = getRandom(0,100);
		if (chance <= insertChance.value){
			results = results.substring(0,results.length-2) + char + insertChar();
		}
		if (chance <= replaceChance.value){ //same thing as insert but it's destroying the old character
			results = results.substring(0,results.length-1) + insertChar();
		}

	}

	//b filter (runs after the others)
	//split result into word tokens
	if (bChance.value > 0){
		var split = results.split(" ");
		//iterate through them
		for (var x = 0; x < split.length; x++){
			chance = getRandom(0,100);
			if (chance <= bChance.value && split[x].length >= bMin.value){
				split[x] = "🅱" + split[x].substring(1);
			}
		}

		//re-build if neccesarry
		//clear out results
		results = "";
		for (var x = 0; x < split.length; x++){
			results += split[x] + " ";
		}
	}
	return results;
}


function changeCase(char){
	var doCapitalize  = document.getElementById("capitalize").checked;
	var doLowercase = document.getElementById("lowercase").checked

		var uppercase = (char == char.toUpperCase());
		if (doLowercase && uppercase){
			return char.toLowerCase();
		}
		if (doCapitalize && !uppercase){
			return char.toUpperCase();
		}
		return char;
}

function insertChar(){
	var Case = getRandom(1,3);
	if (getRandom > 2){
		return String.fromCharCode(getRandom(97,122));
	}
	else{
		return String.fromCharCode(getRandom(65,90));
	}
}

function duplicateChar(char){
	//TODO: add an option to prioritize duplicating certain letters such as t, l, e, etc
	return char + "" + char;
}


function getRandom(min, max){
	return (Math.random() * (max-min) + min);
}

//Copies text in output field to clipboard
function ClipBoard()
{
	var outputField = document.getElementById("outputArea");
	outputField.select();
	var textToCopy=outputField.value;
	var success = document.execCommand('copy');

	if (!success){
		alert("Oops! Unable to copy, either because you are browsing from a mobile device or there was no text to copy. \nIf you are viewing this page on a mobile device, you will need to select the text manually.")
	}
	else{
		if (textToCopy.length > 100){
			textToCopy = textToCopy.substring(0,50) + " [...] " + textToCopy.substring(textToCopy.length-50);
		}
		alert("Copied\n \"" + textToCopy + "\"");
	}
	window.getSelection().removeAllRanges();

}
function capitalizeAll()
{
	var str = document.getElementById("outputArea").value; document.getElementById("outputArea").value = str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}
