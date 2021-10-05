function entry(){
    this.timezone = 0
    this.name = "";
    this.people = []
    this.enabled = true;
}

function range(min,max){
    this.min = min;
    this.max = max;
}

// because JavaScript modulus is wrong for negative numbers
function mod(n, m) {
    return ((n % m) + m) % m;
}

// stores entry objects
let entries = []
const rendertarget = document.getElementById("graphroot")

const localUserOffset = new Date().getTimezoneOffset()/60;
document.getElementById("postinfo").innerHTML = `Relative to your timezone (GMT${localUserOffset<0?"+":"-"}${localUserOffset})`;

// do we have url params?
{
    const params = new URLSearchParams(window.location.search);
    const urlparam = params.get("t")
    if (urlparam != null){
        
        const dec = decodeCompress(urlparam);
        entries = JSON.parse(dec)
        render(rendertarget)
    }
}

/**
 * create the HTML for the current representation
 * @param {HTMLElement} container container to write output
 */
function render(container){
    const allNotOkRanges = [];  // collect all the unavailability ranges here

    container.innerHTML = "";
    let idx = 0;
    for(elt of entries){
        const local = idx;
        // root element
        const root = document.createElement("div");

        // management controls
        const chckbx = document.createElement("input")
        chckbx.type = "checkbox"
        chckbx.onchange = (evt)=>{
            setEnabled(local,evt.srcElement.checked)
        }
        chckbx.checked = elt.enabled;
        root.appendChild(chckbx);

        const delBtn = document.createElement("button")
        delBtn.innerHTML = "❌";
        delBtn.onclick = ()=>{
            deleteElement(local);
        }

        root.appendChild(delBtn);

        if (local != 0){
            const upBtn = document.createElement("button")
            upBtn.innerHTML = "⬆";
            upBtn.onclick = ()=>{
                swapLess(local);
            }
            root.appendChild(upBtn);
        }
        
        if (local != entries.length - 1){
            const downBtn = document.createElement("button")
            downBtn.innerHTML = "⬇";
            downBtn.onclick = ()=>{
                swapGreater(local);
            }
            root.appendChild(downBtn);
        }

        // info
        const data = document.createElement("inline");
        data.innerHTML = `${elt.name} ${elt.people != "" ? `(${elt.people})` : ""}`
        root.appendChild(data);

        // representation
        // for sanity, we use 24-hour time internally, where 0:00 = midnight and 23:59 = 11:59pm
        const notOkRanges = [new range(0,8),new range(23,24)];   //assume (unrealistically) that people sleep from 11pm -> 8am

        //Offset the ranges
        const offset = parseInt(elt.timezone) + localUserOffset;
        for(const range of notOkRanges){
            range.min -= offset;
            range.max -= offset;
            
            range.min = mod(range.min,24.001);
            range.max = mod(range.max,24.001);
        }
        // if a range is split by the beginning and end of the day, create two ranges out of it
        const rangesToAdd = []
        for (const r of notOkRanges){
            if (r.max < r.min){          
                const nrange = new range(0,r.max);
                rangesToAdd.push(nrange);
                r.max = 24;
            }
            if(r.min > r.max){
                const nrange = new range(r.min,24);
                rangesToAdd.push(nrange);
                r.min = 0;
            }
        }
        
        for(const range of rangesToAdd){
            notOkRanges.push(range);
        }
        
        const bgdiv = document.createElement('bar')
        root.appendChild(bgdiv);

        // for the not-ok ranges, add red bars
        // we need this to scale properly
        for(const range of notOkRanges){
            range.min = rangeRemap(range.min,0,24,0,100);
            range.max = rangeRemap(range.max,0,24,0,100);
            const rdiv = document.createElement('innerbar')
            rdiv.style.marginLeft = `${range.min}%`
            rdiv.style.width = `${(range.max-range.min)}%`
            bgdiv.appendChild(rdiv);

            if (elt.enabled){
                allNotOkRanges.push(range);
            }
            else{
                bgdiv.style.opacity = 0.5;
            }
        }
       
        root.appendChild(genNumline())

        idx++
        container.appendChild(root);
    }

    // now we add the final availability bar, containing the intersection of all unavailabilities
    const masterBar = document.createElement('bar')
    const allContainer = document.createElement('div')
    const hr = document.createElement('hr')
    allContainer.appendChild(hr);
    allContainer.appendChild(masterBar);
    for(const range of allNotOkRanges){
        const rdiv = document.createElement('innerbar')
        rdiv.style.marginLeft = `${range.min}%`
        rdiv.style.width = `${(range.max-range.min)}%`
        masterBar.appendChild(rdiv);
    }
    const title = document.createElement('h3')
    title.innerHTML = "All Availability"
    allContainer.firstChild.prepend(title)

    allContainer.appendChild(genNumline())

    container.firstChild.prepend(allContainer)
   

    // lastly, save the data to the URL bar as a compressed string
    let str = JSON.stringify(entries);
    const enc = encodeCompress(str);

    window.history.pushState("", "", document.URL.substring(0,document.URL.indexOf('?')) + "?t=" + enc);;
}   

/**
 * Add a new element based on the config row
 */
function addnew(){

    const mainsel = document.getElementById("mainsel");
    const peoplelist = document.getElementById("peoplelist");

    const e = new entry();
    e.name = mainsel.options[mainsel.selectedIndex].text;
    e.timezone = mainsel.options[mainsel.selectedIndex].value;
    e.people = peoplelist.value.trim();

    peoplelist.value = "";

    entries.push(e);
    render(rendertarget);
}

/**
 * Swap the element with the element below in the list
 * @param {integer} i the index
 */
function swapLess(i){
    let tmp = entries[i];
    entries[i] = entries[i-1];
    entries[i-1] = tmp;
    render(rendertarget)
}

/**
 * Swap the element with the element above in the list
 * @param {integer} i the index
 */
function swapGreater(i){
    let tmp = entries[i];
    entries[i] = entries[i+1];
    entries[i+1] = tmp;
    render(rendertarget)
}

/**
 * Remove the element at the index
 * @param {integer} idx the index
 */
function deleteElement(idx){
    entries.splice(idx,1);
    render(rendertarget);
}

/**
 * Change enabled state
 * @param {Number} idx index into array
 * @param {Boolean} state new enabled state
 */
function setEnabled(idx, state){
    entries[idx].enabled = state
    render(rendertarget);   
}

function rangeRemap(value, low1, high1, low2, high2){
     return low2 + (value - low1) * (high2 - low2) / (high1 - low1)
}

function encodeCompress(str){
    const compressed = LZString.compressToUint8Array(str);
    const arr = [];
    for(let byte of compressed){
        const thisByte = btoa(String.fromCharCode(byte));
        arr.push(thisByte.substring(0,2));  // we know every conversion here ends with '=='
    }
    return arr.join('')
}

function decodeCompress(str){
    // convert to pairs
    const pairs = str.match(/.{1,2}/g);
    let dec = [];
    for(pair of pairs){
        const thisByte = atob(`${pair}==`);
        dec.push(thisByte.charCodeAt(0));
    }
    Uint8Array.from(dec);
    dec = LZString.decompressFromUint8Array(dec);
    return dec;
}

function genNumline(){
    const numLineWrapper = document.createElement("div")
    numLineWrapper.classList="stretcher"
    numLineWrapper.innerHTML = "12 1 2 3 4 5 6 7 8 9 10 11 12 1 2 3 4 5 6 7 8 9 10 11"
    const numlineStretcher = document.createElement("span")
    numlineStretcher.classList = "stretcherSpan"
    numLineWrapper.appendChild(numlineStretcher) 
    return numLineWrapper;
}