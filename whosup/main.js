function entry(){
    this.timezone = 0
    this.name = "";
    this.people = []
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
const entries = []
const rendertarget = document.getElementById("graphroot")

const localUserOffset = - new Date().getTimezoneOffset()/60;

/**
 * create the HTML for the current representation
 * @param {HTMLElement} container container to write output
 */
function render(container){
    container.innerHTML = "";
    let idx = 0;
    for(elt of entries){
        const local = idx;
        // root element
        const root = document.createElement("div");
        const data = document.createElement("inline");
        data.innerHTML = `zone = ${elt.timezone}, name = ${elt.name}, people = ${elt.people}`

        // management controls
        const delBtn = document.createElement("button")
        delBtn.innerHTML = "delete";
        delBtn.onclick = ()=>{
            deleteElement(local);
        }

        root.appendChild(data);
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

        // representation
        // for sanity, we use 24-hour time internally, where 0:00 = midnight and 23:59 = 11:59pm
        const notOkRanges = [new range(0,8),new range(23,23.999)];   //assume (unrealistically) that people sleep from 11pm -> 8am

        //Offset the ranges
        const offset = parseInt(elt.timezone);
        for(const range of notOkRanges){
            range.min += offset;
            range.max += offset;
            
            range.min = mod(range.min,24);
            range.max = mod(range.max,24);
        }
        // if a range is split by the beginning and end of the day, create two ranges out of it
        console.log(notOkRanges)
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
        }

        idx++
        container.appendChild(root);
    }
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
    e.people = peoplelist.value

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

function rangeRemap(value, low1, high1, low2, high2){
     return low2 + (value - low1) * (high2 - low2) / (high1 - low1)
}
