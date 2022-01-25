const filters = []
const filterRoot = document.getElementById("filter-ui");
const output = document.getElementById("output");
let delmode = false;

function Filter(elt){
    this.element = elt;
    this.boxes = [false,false,false,false,false];
    this.mode = 0;  // 0 - all, 1 - any, 2 - does not exist at
    this.char = 0
    this.test = function(word){
        if (this.mode == 1){
            // the character is at the indicated location
            for(let i = 0; i < this.boxes.length; i++){
                if (this.boxes[i] && word[i].charCodeAt() - 97 == this.char){
                    return true;
                }
            }
            return false;
        }
        else if (this.mode == 0){
            for(let i = 0; i < this.boxes.length; i++){
                // the character is at the indicated location, or a different character is NOT at the indicated location
                if((word[i].charCodeAt() - 97 == this.char) ^ (this.boxes[i])){
                    return false;
                }
            }
            return true;
        } 
        else if (this.mode == 2){
            for(let i = 0; i < this.boxes.length; i++){
                //the character is NOT at the indicated location
                if (word[i].charCodeAt() - 97 == this.char && this.boxes[i]){
                    return false;
                }
            }
            return true;
        }
    }
}

function newFilter(){
    let root = document.createElement('div');
    let filterObj = new Filter(root);

    // select letter
    let letter = document.createElement('select');
    for(let l = 65; l <= 90; l++){
        let opt = document.createElement('option')
        opt.innerHTML = String.fromCharCode(l)
        letter.appendChild(opt)
      
    }
    letter.onchange = function(){
        filterObj.char = letter.selectedIndex;
    }
    root.appendChild(letter);

    // mode
    let select = document.createElement('select');
    select.innerHTML = `<option selected>placement matches</option><option>exists at any</option><option>does not exist at</option>`
    select.onchange = function(){
        filterObj.mode = select.selectedIndex;
    }
    root.appendChild(select);

    // position checkboxes
    let cboxRoot = document.createElement('group');
    for(let i = 0; i < 5; i++){
        let cbox = document.createElement('input')
        cbox.type = "checkbox"
        cbox.onchange = function(){
            filterObj.boxes[i] = !filterObj.boxes[i]
        }

        cboxRoot.appendChild(cbox);
    }
    root.appendChild(cboxRoot);

    // deletion button
    let delbtn = document.createElement('button')
    delbtn.innerHTML = '🗑'
    delbtn.classList += "delbtn";
    delbtn.hidden = true;
    root.appendChild(delbtn)
    delbtn.onclick = function(){
        for(let i = 0; i < filters.length; i++){
            if (filters[i].element == root){
                filters.splice(i,1);
                break;
            }
        }
        root.remove();
    }

    filters.push(filterObj)
    filterRoot.appendChild(root);
}

function enableDelBtns(){
    let btns = document.querySelectorAll('.delbtn')
    for(const btn of btns){
        btn.hidden = delmode;
    }
    delmode = !delmode;
}
function doFilter(){
    const results = [];
    for(const word of words){
        let allPassed = true;
        for(const filter of filters){
            if (allPassed && !filter.test(word)){
               allPassed = false
            }
        }
        if(allPassed){
            results.push(word)
        }
    }
    output.innerHTML = `<p><strong>${results.length} results</strong></p>${results.join('<br>')}`
}


// start with one filter
newFilter();