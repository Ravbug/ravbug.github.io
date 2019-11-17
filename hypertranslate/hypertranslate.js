//Load dependencies
function init(){
  //insert this script into the page
  var imported = document.createElement('script');
  imported.src = '../utilities.js';
  document.head.appendChild(imported);
}

//sometimes stuff doesn't load correctly. Call this again if things seem off
init();

var supportedLangs = ["af","sq","am","ar","hy","az","eu","bn","bs","bg","ca","ceb","zh-CN","zh-TW","co","hr","cs","da","nl",
            "en","eo","et","fi","fr","fy","gl","ka","de","el","gu","ht","ha","haw","iw","hi","hmn","hu","is","id","ga",
            "ja","jw","kn","kk","km","ko","ku","lo","lv","lt","lb","mk","mg","ms","ml","mt","mi","mr","mn","ne","no","ny",
            "ps","fa","pl","pt","pa","ro","ru","sm","gd","sr","st","sn","sd","si","sk","sl","so","es","sw","sv",
            "tl","tg","ta","te","th","tr","uk","ur","uz","vi","cy","xh","yi","yo","zu"];


/**
The main engine, calls the Google Translate API to translate the text
-- Parameters --
  text (string): the original text to translate
  begin_lang (string): the language of the original text as an ISO language pair
                      (set to "auto" to have the Translate servers figure out the language)
  end_lang (string): the ISO pair of the language to output
  count (integer): the number of times to translate
  invalid_callback (function(string)): if there is a problem with the query this is called
  error_callback (function()): called if there is a porblem with the network request
  prog_callback (function(int,string)): called on progress updates, with the language used
  complete_callback (function(string)): called when the translation completes, returns the result


*/

function hypertranslate(text, begin_lang, end_lang, count,invalid_callback,error_callback,prog_callback,complete_callback){
 if (!isSupportedLang(begin_lang)){
    invalid_callback("\""+begin_lang + "\" is not a supported starting language.");
    prog_callback(100,"");
    return;
  }
  /*if (!isSupportedLang(end_lang)){
    invalid_callback("\""+end_lang + "\" is not a supported ending language.");
    prog_callback(100,"");
    return;
  }*/

  //make sure count is a number
  if (isNaN(count)){
    prog_callback(100,"");
    invalid_callback("The Translate # Times field has an invalid number.");
    return;
  }
  if (count.length == 0){
    prog_callback(100,"");
    invalid_callback("The Translate # Times field has an invalid number.");
    return;
  }

  var progress = 0;

  translate(text,begin_lang,end_lang,
    function callback(string,sourceLang,targetLang){
      //set up variables
      progress++;
      //parse the returned data into JSON
      var formatted = JSON.parse(string);
      var realText = "";

      for (var line = 0; line < formatted[0].length; ++line) {
        realText += formatted[0][line][0];
      }

      //call finished if done
      if (progress >= count){
        translate(realText,targetLang,end_lang,function(str,src,tgt,prog_callback,complete_callback){
          var f = JSON.parse(str);
          var r = "";
          for (var line = 0; line < f[0].length; ++line) {
            r += f[0][line][0];
          }
          prog_callback(100,end_lang);
          complete_callback(r);
        },error_callback,prog_callback,complete_callback)
      }

      //otherwise do it again
      else{
        var lang = getRandom(0,supportedLangs.length);
        prog_callback(progress/count*100,supportedLangs[lang]);
        translate(realText,targetLang,supportedLangs[lang],callback,error_callback);
      }
    });

}

//helper method for the translate recursive loop
function translate(text, sourceLang, targetLang,callback,error_callback,prog_callback,complete_callback){
 var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl="
            + sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(text);
  httpGetAsync(url,function(string){
    callback(string,sourceLang,targetLang,prog_callback,complete_callback);
  },error_callback);
}

/**
 Determines if the ISO code is a supported language
 -- Parameters --
    str (string): the string to test
-- Returns --
    true if the string is a supported ISO code, false if not
*/
function isSupportedLang(str){
  return arrayContains(supportedLangs,str) || str == "auto";
}
