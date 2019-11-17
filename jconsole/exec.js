onmessage = function(e){
    if (e.data[1]==1){
        var temp = compile(e.data[2]);
        temp = replaceAllSlow(temp,"\\n","<br>");
        run(returnToPrint(e.data[0])+"\n"+temp);
    }
    else{
        run(e.data[0]);
    }
}

function run(input){
    try {
        eval(input);
    }
    catch (e) {
        printError("<br>" + e);
        printError("<br> Line " + e.lineNumber + " col " + e.columnNumber +  "<br>");
    }
    print("<br><span class=prompt>> ")

}

function print(data) {
    postMessage(data)
}

function println(data) {
    print(data + "<br>");
}

function printError(data){
    print("<span style='color:red'><b>" + data + "</b></span>")
}


function help(){
    return "Available commands:<br>" + 
    "run: execute code in the editor<br>" + 
    "help(): opens this menu<br>" + 
    "clear(): clear out the console<br>" + 
    "stop(): terminates the currently running code<br>" +
    "Alternatively, enter any arbitrary JavaScript to execute";
}

function returnToPrint(code){
    code = code.replace(/"/g, '\\"');
    return "print('<span style=\"font-weight:italic;color:gold\">← '+eval(\"" + code + "\")+'</span>')";
}

//Gets only functions and their definitions, so that you can call functions from the terminal without running the code

/**
 * "compiles" code by removing everything that isn't a function.
 * @param {string} code: code to compile
 * @returns {string}: code with only function definition
 */
function compile(code){
    //remove all code comments
    var temp = code.split("\n");
    var tempCode = "";
   
    //remove // comments
    for (var i = 0; i < temp.length; i++){
        var str = temp[i];
        //find // if there
        if (str.includes("//") && !code.includes("http://")){
            //get the piece that doesn't have //
            var pos = str.indexOf("//");
            tempCode+= str.substring(0,pos);
        }
        else{
            tempCode += str;
        }
    }

    code = tempCode;
    //remove /* */ comments
    function count(main_str, sub_str) {
        main_str += '';
        sub_str += '';
    
        if (sub_str.length <= 0) 
        {
            return main_str.length + 1;
        }
    
           subStr = sub_str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
           return (main_str.match(new RegExp(subStr, 'gi')) || []).length;
    }
   
    //name all the functions
    var idx = code.indexOf("function");
    while (idx > 0){
        var fname = code.substring(idx + "function".length(),code.indexOf("(",idx));
        code = code.substring(0,idx) + (fname + "=") + code.substring(idx);
    }

    return code;
}

function replaceAll(orig,toReplace,replaceWith){
	return orig.replace(new RegExp(toReplace, 'g'), replaceWith);
}

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