
console.log("%cI'm aware that it's trivial to cheat at this game with the element inspector.", "color:red;font-size:30px");
let code = [];

const possibleColors = ["red", "orange", "yellow", "green", "purple", "blue"]

let pins = [];
let hintpins = [];
let checkbtns = [];
let currentRow = -1;
let currentCode;
let gameHasEnded = false;

/**
 * Create a popup element for a pin. Insert the element as a child of the owner
 * @param {HTMLButtonElement} owner 
 * @returns the created popup element
 */
function createPopup(owner) {
    //the popup tooltip
    const popup = document.createElement('div');
    popup.className = "popup";
    const content = document.createElement('span');
    content.className = "popuptext";
    for (let i = 0; i < possibleColors.length; i++) {
        const btn = document.createElement('button');
        btn.className = 'colorpin';
        btn.style.backgroundColor = possibleColors[i];
        content.appendChild(btn);
        btn.onclick = (event) => {
            currentCode[owner.getAttribute('pos')] = i;
            owner.style.backgroundColor = possibleColors[i];
            content.classList.remove('show')
            event.stopPropagation();
        }
    }
    popup.appendChild(content);
    return popup;
}

/**
 * Create a pin for the user to enter a code value
 * @param {Number} pos the location of the pin (0-3), used for inserting the code
 * @returns The created pin object. Insert it into the document to see it.
 */
function createPin(pos) {
    const pin = document.createElement('button');
    pin.className = "colorpin";
    pin.disabled = true;
    pin.onclick = () => { pinEnter(pin) }
    pin.setAttribute("pos", pos);

    pin.appendChild(createPopup(pin));
    return pin;
}

/**
 * Called when a pin is clicked
 * @param {HTMLButtonElement} sender the pin that was clicked
 */
function pinEnter(sender) {
    //hide all other popups
    const allpopups = document.querySelectorAll('.popup');
    for (let p of allpopups) {
        p.childNodes[0].classList.remove('show')
    }

    //trigger the button's popup
    const popup = sender.querySelector('.popup').childNodes[0];
    popup.classList.toggle('show');
}

/**
 * Create a hint pin. The codebreaker (CPU) uses this to provide feedback.
 * @returns The created pin object. Insert it into the document to see it.
 */
function createHintPin() {
    const pin = document.createElement('div');
    pin.className = "hintpin"
    return pin;
}

/**
 * Create the button used to check if the code is correct.
 * @returns The check button. Insert it into the document to see it.
 */
function createCheckbtn() {
    const btn = document.createElement('button');
    btn.innerHTML = "Check";
    btn.hidden = true;
    btn.className = "chkbtn";
    btn.onclick = () => { checkMove(btn) };
    return btn;
}

/**
 * Setup the game
 */
function init() {
    const board = document.getElementById('board')
    board.innerHTML = '';

    pins = [];
    hintpins = [];
    checkbtns = [];
    currentRow = -1;
    gameHasEnded = false;
    
    //generate html
    for (let r = 0; r < 10; r++) {
        let answerpins = [];
        let hintpinrow = [];

        let answerCel = document.createElement('div');
        let hintCel = document.createElement('div');

        let btncell = document.createElement('div');
        btncell.className = "btncell";
        for (let c = 0; c < 4; c++) {
            let answerpin = createPin(c);
            answerCel.appendChild(answerpin);
            answerpins.push(answerpin);

            let hintpin = createHintPin();
            hintCel.appendChild(hintpin)
            hintpinrow.push(hintpin);
        }
        const checkbtn = createCheckbtn();
        checkbtns.push(checkbtn);
        btncell.appendChild(checkbtn)

        board.appendChild(answerCel);
        board.appendChild(btncell);
        board.appendChild(hintCel);

        pins.push(answerpins);
        hintpins.push(hintpinrow);
    }

    //decide the code
    code = [];
    for (let i = 0; i < 4; i++) {
        code.push(Math.floor(Math.random() * possibleColors.length));
    }
}

/**
 * Prepare a new turn. Also checks if the game has been lost
 */
function prepareTurn() {
    currentCode = [-1, -1, -1, -1]
    currentRow++;
    //has the game been lost?
    if (currentRow == 10) {
        let losestr = [];
        for(let i = 0; i < 4; i++){
            losestr.push(`<div class="colorpin" style="background-color: ${possibleColors[code[i]]}"></div>`);
        }

        swal({ html:true, title:'You lose!', text:losestr.join(''), icon:"error"})
        gameHasEnded = true;
        //disable the final row
        for (let pin of pins[currentRow - 1]) {
            pin.disabled = true;
        }
        return;
    }
    //enable the row of pins
    for (let pin of pins[currentRow]) {
        pin.disabled = false;
    }
    //disable the previous row
    if (currentRow != 0) {
        for (let pin of pins[currentRow - 1]) {
            pin.disabled = true;
        }
    }
    checkbtns[currentRow].hidden = false;
}

/**
 * Determine the feedback for a move
 * @param {HTMLButtonElement} sender the Checkbutton that initiated the request
 */
function checkMove(sender) {
    sender.hidden = true;
    //hide all other popups
    const allpopups = document.querySelectorAll('.popup');
    for (let p of allpopups) {
        p.childNodes[0].classList.remove('show')
    }

    //red pegs - correct color, correct location
    let colorCounts = [];
    for(let i = 0; i < possibleColors.length; i++){
        colorCounts.push(0);
    }
    for(let i = 0; i < possibleColors.length; i++){
        colorCounts[code[i]]++;
    }
    let counted = [false, false, false, false];
    let n_red = 0;
    let n_white = 0;
    for (let i = 0; i < 4; i++) {
        if (currentCode[i] == code[i]) {
            n_red++;
            colorCounts[code[i]]--;
            counted[i] = true;
        }
    }

    //white pins - correct color, wrong location
    for (let i = 0; i < 4; i++) {
        if (!counted[i]){
            if (colorCounts[currentCode[i]] > 0) {
            n_white++;
            colorCounts[currentCode[i]]--;
            }
        }
    }

    //render hint
    let i = 0;
    for (; i < n_red; i++) {
        hintpins[currentRow][i].style.backgroundColor = "#FF0000";
    }
    for (; i < n_white + n_red; i++) {
        hintpins[currentRow][i].style.backgroundColor = "#FFFFFF";
    }

    //do we need another turn?
    if (n_red == 4) {
        let winstr = [];
        for(let i = 0; i < 4; i++){
            winstr.push(`<div class="hintpin" style="background-color:red"></div>`);
        }

        swal({ html:true, title:'You win!', text:winstr.join(''), icon:"success"})
        gameHasEnded = true;
        //disable the row of pins
        for (let pin of pins[currentRow]) {
            pin.disabled = true;
        }
    }
    else {
        prepareTurn();
    }
}

/* Open */
function tutorial() {
    document.getElementById("tutorial").hidden = false;
}

/* Close */
function closeNav() {
    document.getElementById("tutorial").hidden = true;
}

function reset(){
    if (gameHasEnded || confirm("Really reset?")){
        init();
        prepareTurn();
    }
}

//start game
init();
prepareTurn();