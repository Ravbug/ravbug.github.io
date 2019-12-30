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
    "svg":"",
}

/** User-defined SVG filters will be added here */
const svgfilters = new Set();
{
    //load built in filters
    let builtin = document.getElementById("svg_builtin");
    let svgf = builtin.getElementsByTagName("filter");
    for (let f of svgf){
        svgfilters.add(f.id);
    }
}
const svgelem = document.getElementById("svg_user");

let renderview = document.getElementById("image")

//the list of adjustment layer blocks
let order = [];

/**
 * Updates the render preview
 * @param {Event} event the event from sender
 */
function render(event){
    let queue = [];
    //iterate through adjustment groups
    for (let group of order){
        //should evaluate this group?
        if (group.enable.checked){
            for (let filter of group.adjustments){
                //if not SVG
                if (filter.name=="svg"){
                    if (filter.enable.checked){
                        queue.push(`url(#${filter.select.options[filter.select.selectedIndex].text})`);
                    }
                }
                else{
                    //should enable adjustment?
                    if (event && (filter.slider == event.srcElement || filter.number == event.srcElement)){
                        filter.enable.checked = true;
                    }
                    
                    if (filter.enable.checked){
                        let value = filter.slider.value;
                        //add the function, value, and unit to the queue
                        queue.push(`${filter.name}(${value}${filters[filter.name]["unit"]})`);
                    }  
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
 * @returns the adjustment created
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
    let delbtn = document.createElement('button');
        delbtn.innerHTML = "❌"
        delbtn.id = "delbtn";
    let separator = document.createElement('br');
    let btnup = document.createElement('button');
        btnup.innerHTML = "↑";
    let btndown = document.createElement('button');
        btndown.innerHTML = "↓";
    let btngroup = document.createElement('div');
        btngroup.id = "orderbtngroup";
    let btnmaster = document.createElement('div');
    let tgroup = document.createElement('div');

    let slider, numeric, svgentry, svgselector;
    if (filter == "svg"){
        svgentry = document.createElement('div');
        svgentry.innerHTML = 
        `
        Filter: <select onclick="loadFilters(this)"><option>${Array.from(svgfilters)[0]}</option></select>
        <button onclick="importsvg()">+</button>
        `
        svgselector= svgentry.getElementsByTagName("select")[0];
        svgselector.onchange = function(){
            enable.checked=true;
            render();
        }
        
    }
    else{
        slider = document.createElement('input');
            slider.type="range"; slider.style="width:100%";
            slider.min = d.min, slider.max = d.max; slider.value = d.val;
            slider.step = d.step;
        numeric = document.createElement('input');
            numeric.type="number"
            numeric.value = slider.value;
            numeric.min = d.min; numeric.max = d.max;
            numeric.step = d.step;
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
    }

    //append the controls
    btnmaster.appendChild(delbtn);
    btngroup.appendChild(btnup);
    btngroup.appendChild(btndown);
    btnmaster.appendChild(btngroup);
    tgroup.appendChild(enable);
    tgroup.appendChild(title);
    root.appendChild(tgroup);
    root.appendChild(btnmaster);
    if (filter == "svg"){
        root.appendChild(svgentry);
    }
    else{
        root.appendChild(slider);
        root.appendChild(numeric);
    }
    root.appendChild(separator);
    group.display.appendChild(root);

    //create render object
    let adjustment = {
        "name":filter,
        "enable":enable,
        "slider":slider,
        "number":numeric,
        "setvalue":function(newval){
            slider.value = newval;
            numeric.value = newval;
        },
        "select":svgselector
    };

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
    btnup.onclick = () => {
        for (let i = 0; i < group.adjustments.length; i++){
            let a = group.adjustments[i];
            if ((a.name == "svg" && a.select == svgselector) || a["slider"]  == slider){
                //move element towards front of list
                if (i > 0){
                    //update display
                    if (group.adjustments[i-1].name == "svg"){
                        group.adjustments[i-1].select.parentElement.parentElement.insertAdjacentElement("beforebegin",root)
                    }
                    else{
                        group.adjustments[i-1].slider.parentElement.insertAdjacentElement("beforebegin",root)
                    }

                    //update render order
                    array_move(group.adjustments,i, i - 1);
                    render()
                }       
                return;
            }
        }
    }
    btndown.onclick = () => {
        for (let i = 0; i < group.adjustments.length; i++){
            let a = group.adjustments[i];
            if ((a.name == "svg" && a.select == svgselector) || a["slider"]  == slider){
                //move element towards end of list
                if (i < group.adjustments.length-1){
                    //update display
                    if (group.adjustments[i+1].name == "svg"){
                        group.adjustments[i+1].select.parentElement.parentElement.insertAdjacentElement("afterend",root)
                    }
                    else{
                        group.adjustments[i+1].slider.parentElement.insertAdjacentElement("afterend",root)
                    }

                    //update render order
                    array_move(group.adjustments,i, i + 1);
                    render()
                    return;
                }     
            }
        }
    }

    //add slider to render queue
    group.adjustments.push(adjustment);

    return adjustment;
}

/**
 * Create an Adjustment group
 * @returns the group created
 */
function addAdjustmentGroup(){
    //create html elements
    let root = document.createElement('adjgroup');
    let select = document.createElement('select');
    let enable = document.createElement('input');
        enable.type = "checkbox";
        enable.checked = true;
    let name = document.createElement('b');
        name.innerHTML = "Adjust Group #" + Math.random().toString(36).substring(10);;
    let addbtn = document.createElement('button');
        addbtn.innerHTML = "+";
    let delbtn = document.createElement('button');
        delbtn.innerHTML = "❌";
        delbtn.id = "delbtn";
    //reorder buttons
    let btnssort = document.createElement('div');
    let btnup = document.createElement('button');
        btnup.innerHTML = "↑";
    let btndown = document.createElement('button');
        btndown.innerHTML = "↓";
        btnssort.id = "orderbtngroup";
    let btngroup = document.createElement('div');
        btngroup.style = "display:inline-block";


    //setup combo box items
    let names = Object.keys(filters);
    for(let name of names){
        let option = document.createElement('option');
        option.appendChild(document.createTextNode(name));
        option.value=name;
        select.appendChild(option);
    }
    btnssort.appendChild(btnup);
    btnssort.appendChild(btndown);
    btngroup.appendChild(btnssort);
    btngroup.appendChild(delbtn);
    root.appendChild(document.createElement('hr'));
    root.appendChild(enable);
    root.appendChild(name);
    root.appendChild(btngroup);
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
    btnup.onclick = () => {
        for (let i = 0; i < order.length; i++){
            let g = order[i];
            if (g.display == root){
                //move element towards front of list
                if (i > 0){
                    //update display
                    order[i-1].display.insertAdjacentElement("beforebegin",root)

                    //update render order
                    array_move(order,i, i - 1);
                    render()
                }       
                return;
            }
        }
    }
    btndown.onclick = () => {
        for (let i = 0; i < order.length; i++){
            let g = order[i];
            if (g.display == root){
                //move element towards end of list
                console.log(i);
                if (i < order.length-1){
                    //update display
                    order[i+1].display.insertAdjacentElement("afterend",root)

                    //update render order
                    array_move(order,i, i + 1);
                    render()
                    return;
                }     
            }
        }
    }
    controls.appendChild(root);

    //add group to render list
    order.push(group);

    return group;
}

/**
 * Moves an element from one position to another in an array
 * @param {*[]} arr Array to change
 * @param {number} old_index Index of element to move
 * @param {number} new_index Index to move to
 * @source https://stackoverflow.com/questions/5306680/move-an-array-element-from-one-array-position-to-another
 */
function array_move(arr, old_index, new_index) {
    if (new_index >= arr.length) {
        var k = new_index - arr.length + 1;
        while (k--) {
            arr.push(undefined);
        }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
};

/**
 * Turns an image into a data URL
 * @param {string} url URL of the image to change
 */
async function imgToDataURL(url) {
    return new Promise(function(resolve,reject){

        //if already a data URL, skip
        if (url.startsWith("data:")){
            resolve(url);
            return;
        }

        let image = new Image();

        image.onload = function () {
            let canvas = document.createElement('canvas');
            canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
            canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size
    
            canvas.getContext('2d').drawImage(this, 0, 0);
    
            // Get raw image data
            //resolve(canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, ''));
    
            // ... or get as Data URI
            resolve(canvas.toDataURL('image/png'));
    
            canvas.remove();
        };
    
        image.src = url;
    });
}

/**
 * Download the image as a non-destructive edit document
 * @param {string} name the name of the document to download
 * @param {boolean} includeImg true to include the image as a data URL, false otherwise
 */
async function dlEditDoc(name="adjustments",includeImg=false){
    //get image
    let doc = {}
    if (includeImg){
        doc["img"] = await imgToDataURL(document.getElementById("image").src)
    }
    //get custom SVG filters
    doc["filters"] = svgelem.innerHTML;

    //get adjustments
    let all = [];
    for (let group of order){
        let g_adj = {"on":group.enable.checked,"adj":[]};
        for (let adj of group.adjustments){
            if (adj.name == "svg"){
                g_adj["adj"].push({"name":adj.name,"val":adj.select.options[adj.select.selectedIndex].text,"on":adj.enable.checked});
            }
            else{
                g_adj["adj"].push({"name":adj.name,"val":adj.slider.value,"on":adj.enable.checked});
            }
        }
        all.push(g_adj);
    }
    doc["adj"] = all;
    download(name+".json",JSON.stringify(doc));
}

/**
 * Prompts the user to upload an SVG filter file
 */
function importsvg(){
    //prompt user for string representing svg filter
    let svgstr = prompt("Paste complete SVG filter");
    if (svgstr){
        //create a filter element out of the string
        let svg = document.createElement('svg');
        svg.innerHTML = svgstr;
        //get the ID of the filter element, add to the Set
        let filterID = svg.getElementsByTagName('filter')[0].id;
        //add the filter element to the SVG filters element
        svgfilters.add(filterID);
        svg.remove();
        svgelem.innerHTML += svgstr;
    }
}

/**
 * Adds the currently loaded SVG filters as options to a select element
 * @param {HTMLElement} select the element to add options to
 */
function loadFilters(select){
    let selection = select.selectedIndex;
    let html = [];
    for (let name of svgfilters){
        html.push(`<option>${name}</option>`)
    }
    select.innerHTML = html.join('');
    select.selectedIndex = selection;
}
