
var p = document.getElementById("render");
var i = document.getElementById("input");
var slider = document.getElementById("editWidth")
var warned = false;
var live = true;

//create codemirror instance
let editor;
{
    let config = {
        lineNumbers:true,
        matchBrackets:true,
        autoCloseBrackets: true,
        highlightSelectionMatches: true,
        styleActiveLine: true,
        autohint: true,
        htmlMode:true,
        fixedGutter:true,
        lint: { lintOnChange: true },
        mode:"htmlmixed",
    }
    //dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        config["theme"] = "material";
    }
    editor = CodeMirror.fromTextArea(i,config);
}



//on change events, update viewer
editor.on("change",function(){
    Krender();
});

//intellisense-like autocomplete: https://stackoverflow.com/questions/13744176/codemirror-autocomplete-after-any-keyup
editor.on('keyup', (editor,event) => {
    let ExcludedIntelliSenseTriggerKeys =   {
        "8": "backspace",
        "9": "tab",
        "13": "enter",
        "16": "shift",
        "17": "ctrl",
        "18": "alt",
        "19": "pause",
        "20": "capslock",
        "27": "escape",
        "33": "pageup",
        "34": "pagedown",
        "35": "end",
        "36": "home",
        "37": "left",
        "38": "up",
        "39": "right",
        "40": "down",
        "45": "insert",
        "46": "delete",
        "91": "left window key",
        "92": "right window key",
        "93": "select",
        "107": "add",
        "109": "subtract",
        "110": "decimal point",
        "111": "divide",
        "112": "f1",
        "113": "f2",
        "114": "f3",
        "115": "f4",
        "116": "f5",
        "117": "f6",
        "118": "f7",
        "119": "f8",
        "120": "f9",
        "121": "f10",
        "122": "f11",
        "123": "f12",
        "144": "numlock",
        "145": "scrolllock",
        "186": "semicolon",
        "187": "equalsign",
        "188": "comma",
        "189": "dash",
        "190": "period",
        "191": "slash",
        "192": "graveaccent",
        "220": "backslash",
        "222": "quote"
    }
    var __Cursor = editor.getDoc().getCursor();
    var __Token = editor.getTokenAt(__Cursor);

    if (!editor.state.completionActive &&
        !ExcludedIntelliSenseTriggerKeys[(event.keyCode || event.which).toString()] &&
        (__Token.type == "tag" || __Token.string == " " || __Token.string == "<" || __Token.string == "/"))
    {
        CodeMirror.commands.autocomplete(editor, null, { completeSingle: false });
    }
  });

editor.setSize(null,null);

i.remove();

function toggleDarkView(state){
    p.style.backgroundColor = state? "white" : "unset"
  }

//if base64 encoded arg is present, load its contents
var arg = getURLArgValue('c');
if (arg != undefined){
  i.value=atob(decodeURIComponent(arg))
  writeURLArgs([]);
}
else{
  editor.setValue(samplecode);
}
delete samplecode;
render();
changeFont(document.getElementById("fontSize").value)

function render(){
//   if (!i.value.length == 0){
//     //disables the UI
//     generateEmbed(i.value)
//   }
  //draw into iframe
  p.srcdoc = editor.getValue();
}

function Krender(){if (live) {render()}}

function generateEmbed(code){
  try{
    var str =  encodeURIComponent(btoa(code));
    warned=false;
    document.getElementById('urlCopyBtn').style = "";
    return str;
  }
  catch(e){
    if (!warned){

      document.getElementById('urlCopyBtn').style = "color:gray;";
      warned=true;
      return undefined;
    }
  }
}

//creates a sharable link to the code. If the link is too long or cannot be encoded,
//it uploads the code to a google sheet and generates a different URL
function createShareLink(){
    var link = generateEmbed(editor.getValue());
    if (link != undefined){
      //use the base64 encoding
      document.getElementById('urlCopy').value=window.location.protocol + "//" + window.location.hostname+"/codevisualizer?c="+link;
      document.getElementById('urlCopy').style='display:;';copy(document.getElementById('urlCopy'));document.getElementById('urlCopy').style='display:none;'
    }
    else{
      //Server upload to Google Sheet. For now, just warn user and fail out
      swal({
        title: "Heads Up!",
        text: "This content could not be encoded into a URL. URL sharing is currently disabled.\n\nURL sharing will automatically resume at the next possible chance",
        type: "error",
        closeOnConfirm: false,
      });
    }
}

function toggleLive(state){
  live = state;
  if (state){
    render();
  }
}

function copySuccess(textToCopy){
  sweetAlert("Copied!", "Copied \"" + textToCopy + "\"", "success");
}
function copyFailed(){
  swal("Copy Failed!", "Either there is nothing to copy, or you are using a mobile device.\nIf you are using a mobile device, please select and copy manually. Sorry!", "error");
}

function loadRemoteResource(){
    swal({
      title: "Load Remote Resource",
      text: "This feature could cause unexpected results",
      type: "input",
      showCancelButton: true,
      closeOnConfirm: false,
      inputPlaceholder: "Enter URL to load"
    },
    function(inputValue){
      if (inputValue === false) return false;

      if (inputValue === "") {
        swal.showInputError("You must enter a URL to load.");
        return false
      }
      swal({title:"Loading Resource", text:"Loading response from " + inputValue,  success:true,timer:2000});
      const cors = "https://cors-anywhere.herokuapp.com/";
      httpGetAsync(cors+inputValue,function onSuccess(data){editor.setValue(data);setTimeout(render(),3000)},function onFailure(){swal("Oops!","Failed to load resouce at " + inputValue,"error")})
    });
}

function downloadWrapper(){
  swal({
    title: "Save HTML file",
    text: "Name your file",
    type: "input",
    showCancelButton: true,
    closeOnConfirm: false,
    inputPlaceholder: "filename.html"
  },
  function(inputValue){
    if (inputValue === false) return false;

    if (inputValue === "") {
      swal.showInputError("You must enter a filename");
      return false
    }
    else{
      if (!inputValue.includes(".html")){
        inputValue += ".html";
      }
    }
    swal({title:"Downloading...", text:"Your browser should download your file shortly" + inputValue,  success:true,timer:2000});
    download(inputValue,document.getElementById('input').value)
  });
}

function helpMenu(){
  swal("About CodeVisualizer","This is a simple live webpage code visualizer.\n\nThe editor uses CodeMirror for syntax highlighting.\n\n Press the share (link) button to get a shareable link to your code!\n\nView Full Window creates a popup displaying your code without the editor or other elements.\n\nThis is an experimental code editor, and you use it at your own risk. If you encounter a bug, open an issue on this website's repository.");
}

function redirect(){
  //open a popup window
  let win = window.open("","CodeVisualizer Preview","toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=540,height=480,top="+(screen.height-700)+",left="+(screen.width-840));
  win.document.body.innerHTML = editor.getValue();
}

slider.oninput = function(){
  document.getElementById("maindisplay").style.gridTemplateColumns = `${this.value}fr ${1-this.value}fr`;
}

//adjusts the fontsize and the line #s div if necessary
function changeFont(newSize){
  document.getElementById("codecontainer").style.fontSize=`${newSize}px`;
}

//synchronous scrolling between line numbers and code div

//prompt for unsaved
window.onbeforeunload = function(){return true;}