//describes properties about the filters
const filters = {
    "contrast":{unit: "%", min: 0, max: 200, val: 100},  
    "blur":{unit: "px", min: 0, max: 10, val: 0, step:0.1}, 
    "brightness":{unit: "", min: 0.0, max: 2.0, val: 1, step:0.01},
    "grayscale":{unit: "%", min: 0, max: 100, val: 0},
    "hue-rotate":{unit: "deg", min: 0, max: 360, val: 0},
    "invert":{unit: "%", min: 0, max: 100, val: 0},
    "saturate":{unit: "%", min: 0, max: 200, val: 100},
    "sepia":{unit: "%", min: 0, max: 100, val: 0}
}

let renderview = document.getElementById("image")

let order = [];

/**
Creates the filter render queue
*/
function render(event){
    let queue = [];
    for (let filter of order){
        //should enable brick?
        if (filter.slider == event.srcElement){
            filter.enable.checked = true;
        }

        if (filter.enable.checked){
            let val = filter.slider.value;
            //add the function, value, and unit to the queue
            queue.push(`${filter.name}(${val}${filters[filter.name]["unit"]})`);
        }   
    }
    //apply the queue
    renderview.style.filter = queue.join(' ');
}

//setup combo box for picking adjustments
{
    let combo = document.getElementById("filterpicker")
    let names = Object.keys(filters);
    for(let name of names){
        let option = document.createElement('option');
        option.appendChild(document.createTextNode(name));
        option.value=name;
        combo.appendChild(option);
    }
}

/**
 * Adds an adjustment
 * @param {} element 
 */
function addAdjustment(element){
    let controls = document.getElementById("controlframe")
    let filter = element.options[element.selectedIndex].text
    let d = filters[filter];
    if (!d.step){
        d.step=1;
    }
    //create the elements that make the adjustment
    let enable = document.createElement('input');
        enable.type = "checkbox";
    let title = document.createElement('b');
        title.innerHTML = filter;
    let slider = document.createElement('input');
        slider.type="range"; slider.style="width:100%";
        slider.min = d.min, slider.max = d.max; slider.value = d.val;
        slider.step = d.step;
    let separator = document.createElement('hr');
    //append the controls
    controls.appendChild(enable);
    controls.appendChild(title);
    controls.appendChild(slider);
    controls.appendChild(separator);
    //attach events
    slider.oninput = render;
    enable.oninput = render;

    //create render object
    let adjustment = {
        "name":filter,
        "enable":enable,
        "slider":slider,
    };
    //for auto-enabling adjustments when a slider is changed
    slider["renderptr"] = adjustment;

    //add slider to render queue
    order.push(adjustment);
}

function loadurl(){
    let url = document.getElementById("img-url").value;
    document.getElementById("image").src=url;
}

render()