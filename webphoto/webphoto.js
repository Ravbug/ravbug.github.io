let controls = document.getElementById("controlframe")

//describes properties about the filters
const filters = {
    "contrast":{unit: "%", min: 0, max: 200, val: 100},  
    "blur":{unit: "px", min: 0, max: 10, val: 0, step:0.1}, 
    "brightness":{unit: "", min: 0.0, max: 2.0, val: 1, step:0.01},
    "grayscale":{unit: "%", min: 0, max: 100, val: 0},
    "hue-rotate":{unit: "deg", min: 0, max: 360, val: 0},
    "invert":{unit: "%", min: 0, max: 100, val: 0},
    "saturate":{unit: "%", min: 0, max: 200, val: 100},
    "sepia":{unit: "%", min: 0, max: 100, val: 0},
    "opacity":{unit: "%", min: 0, max: 100, val: 100},
}

let renderview = document.getElementById("image")

//the list of adjustment layer blocks
let order = [];

/**
Creates the filter render queue
*/
function render(event){
    let queue = [];
    //iterate through adjustment groups
    for (let group of order){
        //should evaluate this group?
        if (group.enable.checked){
            for (let filter of group.adjustments){
                //should enable adjustment?
                if (event && (filter.slider == event.srcElement || filter.number == event.srcElement)){
                    filter.enable.checked = true;
                }

                if (filter.enable.checked){
                    let val = filter.slider.value;
                    //add the function, value, and unit to the queue
                    queue.push(`${filter.name}(${val}${filters[filter.name]["unit"]})`);
                }   
            }
        }    
    }
    //apply the queue
    renderview.style.filter = queue.join(' ');
}

/**
 * Adds an adjustment
 * @param {string} filter the name of the adjustment to add
 * @param {{}} group the group structure to add
 */
function addAdjustment(filter,group){
    let d = filters[filter];
    if (!d.step){
        d.step=1;
    }
    //create the elements that make the adjustment
    let root = document.createElement('adjustment')
    let enable = document.createElement('input');
        enable.type = "checkbox";
    let title = document.createElement('i');
        title.innerHTML = filter;
    let slider = document.createElement('input');
        slider.type="range"; slider.style="width:100%";
        slider.min = d.min, slider.max = d.max; slider.value = d.val;
        slider.step = d.step;
    let delbtn = document.createElement('button');
        delbtn.innerHTML = "–"
    let separator = document.createElement('br');
    let numeric = document.createElement('input');
        numeric.type="number"
        numeric.value = slider.value;
        numeric.min = d.min; numeric.max = d.max;
        numeric.step = d.step;

    let tgroup = document.createElement('div');

    //append the controls
    tgroup.appendChild(enable);
    tgroup.appendChild(title);
    root.appendChild(tgroup);
    root.appendChild(delbtn);
    root.appendChild(slider);
    root.appendChild(numeric);
    root.appendChild(separator);
    group.display.appendChild(root);

    //create render object
    let adjustment = {
        "name":filter,
        "enable":enable,
        "slider":slider,
        "number":numeric
    };

    //attach events
    slider.oninput = function(event){
        //update the number field
        numeric.value = slider.value;
        render(event);
    }
    numeric.oninput = function(event){
        //constrain to acceptable range
        if (numeric.value < d.min){
            numeric.value = d.min;
        }
        if (numeric.value > d.max){
            numeric.value = d.max;
        }

        //update the slider
        slider.value = numeric.value;
        render(event);
    }
    enable.oninput = render;
    delbtn.onclick = function(){
        //find in the render queue
        for (let i = 0; i < group.adjustments.length; i++){
            let a = group.adjustments[i];
            if (a["slider"] == slider){
                //remove from this group's adjustment
                group.adjustments.splice(i,1);

                 //remove from drawing
                root.remove();
                render();
                return;
            }
        }
        //something went wrong
        alert("Unable to remove adjustment");
    }

    //add slider to render queue
    group.adjustments.push(adjustment);
}

/**
 * Create an Adjustment group
 */
function addAdjustmentGroup(){
    //create html elements
    let root = document.createElement('div');
    let select = document.createElement('select');
    let enable = document.createElement('input');
        enable.type = "checkbox";
        enable.checked = true;
    let name = document.createElement('b');
        name.innerHTML = "Adjustment Group";
    let addbtn = document.createElement('button');
        addbtn.innerHTML = "+";
    let delbtn = document.createElement('button');
        delbtn.innerHTML = "Delete";

    //setup combo box items
    let names = Object.keys(filters);
    for(let name of names){
        let option = document.createElement('option');
        option.appendChild(document.createTextNode(name));
        option.value=name;
        select.appendChild(option);
    }
    root.appendChild(document.createElement('hr'));
    root.appendChild(enable);
    root.appendChild(name);
    root.appendChild(delbtn);
    root.appendChild(select);
    root.appendChild(addbtn);

    //create structure
    let group = {
        display:root,
        "name":name,
        "enable":enable,
        adjustments:[]
    };
    //hook up events
    addbtn.onclick = function(){
        let name = select.options[select.selectedIndex].text;
        addAdjustment(name,group);
    }
    enable.oninput = function(){
        //TODO: dim group if disabled
        render();
    };
    delbtn.onclick = function(){
        //find this group in the order
        for (let i = 0; i < order.length; i++){
            let g = order[i];
            if (g.display == root){
                //remove from the order
                order.splice(i,1);

                 //remove from the sidebar       
                root.remove();
                render();
                return;
            }
        }
        //something went wrong
        alert("Unable to remove adjustment group")
    }
    controls.appendChild(root);

    //add group to render list
    order.push(group);
}


render();