
/*
Inserts the necesarry dependencies into the page.
This must be callled before any other methods in this file are called

If things seem whack call this again.
*/
function init(){
  //insert this script into the page
  var imported = document.createElement('script');
  imported.src = 'emojis-keywords.js';
  document.head.appendChild(imported);
  imported = document.createElement('script');
  imported.src = 'emojis-list.js';
  document.head.appendChild(imported);
  imported = document.createElement('script');
  imported.src = 'is-emoji-keyword.js';
  document.head.appendChild(imported);
}

init();


//var synonyms = [["i","man"]];


/*
  Convert all emoji keywords into unicode emojis or
  character codes for the VOIP service Discord.
  -- Parameters --
  text - the string to emojitize
  discordmode - a BOOL to tell if the generator should create unicode
                emojis or discord tokens
  mode - Switch between strict, ratio, and loose algorithms
  ratio - the % similarity for ratio mode
  operation - replace, append, or prepend emojis
  -- Returns --
    The original string but all emoji tokens were replaced
*/
function emojitize(text,discordmode,mode,ratio,operation){
  //add spaces before punctuation (EXPRESSES ODD BEHAVIOR WITH CONSECUTIVES!)

  for (var i = 0; i < text.length-1; i++){
    if (isPunctuation(text.charAt(i+1))){
      text = text.slice(0,i+1) + " " + text.charAt(i+1) + " " + text.slice(i+2,text.length);
      i+=2;
    }
  }
  //split by word
  var array = text.split(" ");

  var result = "";
  var isEmoji, emojis, keywords;
  //attempt to reference emoji libraries
  try{
    isEmoji = require('is-emoji-keyword');
    emojis = require('emojis-list');
    keywords = require('emojis-keywords');
  }
  //if reference fails, the scripts did not load. warn user
  catch(error){
    setTimeout(update(),1000);
    return "Loading... \n\nIf this does not go away, press [Translate] again.";
  }

  //Unicode mode
      for (var i = 0; i < array.length; i++){
        var word = array[i];
        //lowercase word clone
        var toComp = word.toLowerCase();

        //skip blank "words"
        if (word == ""){continue;}
        //search the database for the index of the correct emoji
        var emojidx = matchEmoji(toComp,mode,ratio);

        //if the emoji was found
        if (emojidx != -1){
          //if discord mode create a colon token (:dog:)
          if (discordmode){
            result += buildWithOperation(operation,word,keywords[emojidx]);
          }
          //if in unicode mode, add the emoji character itself
          else{
            result += buildWithOperation(operation,word,emojis[emojidx]);
          }
        }
        //if not found, insert the original token
        else{
          result += word + " ";
        }
      }
  return result;
}

/*
to avoid code copypasting, adds emoji with the correct settings.
-- Parameters ---
  operation: append, prepend, or replaced
  string: the string to apply operation to
  append: the string that is appended, prepended, or replaced
*/
function buildWithOperation(operation, string, append){
  switch(parseInt(operation)){
    case 0:
      return " " + append + " ";
      break;
    case 1:
      return " " + string + " " + append + " ";
       break;
    case 2:
      return " " + append + " " + string + " ";
      break;
    default:
      return "";
  }
}



/*
  Looks up string in a database to determine if it is an emoji keyword
  Because the keyword array is a 1:1 mapping of the emoji array, the
  found index can simply be inserted in to the unicode array to get the emoji.

  This method is bypassed in Discord mode.
  -- Parameters --
  string - the text to look up
  mode - the string similarity level_slider
        0: exact match
        1: 1/3 match
        2: 1+ character matches (will do wierd things!)
  -- Returns --
    The index if found, -1 if not found.
*/
function matchEmoji(string,mode,ratio){
  if (string == "ok") string = "ok_hand";

  var keywords = require('emojis-keywords');
  for (var i = 0; i < keywords.length; i++){
    var key = keywords[i];

    var order = orderStringsByLength(key.substring(1,key.length-1),string);

    //mode system: 2, 1, 0
    if ((order[1].includes(order[0]) && mode==2)
          || (order[1].includes(order[0]) && mode == 1 && getStringRatio(order[0],order[1]) >= ratio)
          ||(key.indexOf(":" + string + ":") != -1 && mode == 0))
    {
      return i;
    }

  }
  return -1;
}

/*
Takes a string with emojis, and converts it back into english.
-- Parameters --
  string: the text to "fix"
  discord: whether the string contains discord :colon: codes or unicode emojis
-- Returns --
  the text with emojis removed and their keys in their places
*/
function reverseEmojitize(string, discord){
  //split by word
  var array = string.split(" ");

  var isEmoji, emojis, keywords;
  //attempt to reference emoji libraries
  try{
    isEmoji = require('is-emoji-keyword');
    emojis = require('emojis-list');
    keywords = require('emojis-keywords');
  }
  //if reference fails, the scripts did not load. warn user
  catch(error){
    setTimeout(update(),1000);
    return "Loading... \n\nIf this does not go away, press [Translate] again."
  }

  //do the work here
var result = "";

  for (var i = 0; i< array.length; i++){
    var idx = matchEnglish(array[i],discord);
    if (idx != -1){
      var add = colonCodeToPlain(keywords[idx]) + " ";
      result += add;
    }
    else{
      result += array[i].replace(/ /g, "") + " ";
    }
  }

  //remove double spaces
  result = result.replace(/  /g, " ");
  return result;
}

/*
 Sequentially searches the emoji database to find the index where the
 translation is located
*/
function matchEnglish(string, discord){
  //search for the emoji
  var emojis = require('emojis-list');
  var keywords = require('emojis-keywords');

  for (var i = 0; i < emojis.length; i++){
    //if it's there, return the index
    if (string.includes(emojis[i]) && !discord){
      return i;
    }
    else if (string.includes(keywords[i]) && discord){
      return i;
    }
  }

  //else, return -1
  return -1;
}

/*
  Converts "":a_colon_code:" into "a colon code"

*/
function colonCodeToPlain(colon){
  var result = "";

  for (var i = 0; i < colon.length; i++){
    var char = colon.charAt(i);
      if (char == "_" ){
        result += " ";
      }
      else if (char != ":" && (char <= "0" || char >= "9")){
        result += char;
      }
    }
    //return trim spaces, replace "tone" with nothing, and return
  return result.trim().replace(/tone/g, "");
}

//determine if a string is punctuation
function isPunctuation(string){
  var punctuation = [".","?","!","\"","\'",",","+","-","/","=","*",
                    "@","#","$","%","^","&","(",")","<",">",";","[","]","{","}","~","_"];
  for (var i = 0; i < punctuation.length; i++){
    if (string == punctuation[i]){
      return true;
    }
  }
  return false;
}
