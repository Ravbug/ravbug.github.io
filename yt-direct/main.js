//CORS forwarding service URL
const cors = "https://cors-anywhere.herokuapp.com/";

const options = document.getElementById('optionSelector');
const videoPlayer = document.getElementById('video');
const audioPlayer = document.getElementById('audio');

let videodata = [];

async function run() {
    //get the video data structure from YouTube
    let rawdata = await getVideoStats(document.getElementById('videoID').value);
    console.log(rawdata);

    //download the manifest
    //let manifestURL = getManifestURL(rawdata);
    
    videodata = [];
    let choices = [];

    //add the auto (manifest) option
    {
        let manifestURL = getManifestURL(rawdata);
        let disabledState = '';
        if (manifestURL == undefined){
            disabledState = 'disabled';
            videodata.push(undefined);
        }
        else{
            videodata.push(manifestURL);
        }
        choices.push(`<option ${disabledState} default>video + audio auto quality (manifest) ${manifestURL == undefined? '[not available]' : `type: ${manifestURL['type']}`}</option>`);
        
    }

    //add the Format option(s)
    for(let i = 0; i < rawdata['streamingData']['formats'].length; i++){
        let item = rawdata['streamingData']['formats'][i];
        videodata.push(item);
        choices.push(`<option>format ${i} - video + audio ${item['width']}✕${item['height']} quality ${item['quality']}</option>`);
    }

    //add the adaptive formats options
    for(let item of rawdata['streamingData']['adaptiveFormats']){
        if (item['mimeType'].includes('video')){
            type = 'video';
            choices.push(`<option>video only - ${item['width']}✕${item['height']} @${item['fps']}fps quality ${item['quality']}</option>`);
        }
        else if (item['mimeType'].includes('audio')){
            choices.push(`<option>audio only - bitrate ${item['bitrate']} quality ${item['audioQuality']} </option>`);
        }
        videodata.push(item);
    }

    //populate select element
    options.innerHTML = choices.join('');

    //invoke selection event
    selectChanged(options);

    //populate static video info section
    populateStaticData(rawdata);
}

/**
 * Writes values into the static video details section
 * @param {Object} rawdata the get_video_info structure
 */
function populateStaticData(rawdata){
    //read VideoDetails section
    let vdetails = rawdata['videoDetails'];
    document.getElementById('staticVidStats').innerHTML = 
`
Title: <a href='https://youtube.com/watch?v=${vdetails['videoId']}'>${plusToSpace(vdetails['title'])}</a> <br>
Channel: <a href='https://youtube.com/channel/${vdetails['channelId']}'>${plusToSpace(vdetails['author'])}</a><br>
Rating: <progress max=5 min=0 value=${vdetails['averageRating']}></progress> ${vdetails['averageRating']} / 5<br>
Views: ${vdetails['viewCount']}<br>
<details><summary>Keywords</summary>${plusToSpace(vdetails['keywords'].join(', '))}</details>
<details><summary>Short Description</summary>${plusToSpace(vdetails['shortDescription']).replace(/\n/g,'<br>')}</details>
`;
}

function plusToSpace(string){
    return string.replace(/\+/g,' ');
}

/**
 * called when the selection element has changed
 * @param {HTMLSelectElement} select the sender of the event
 */
function selectChanged(select){
    let i = select.selectedIndex;
    //auto (manifest version) special case
    if (i == 0){
        videoPlayer.style.display = '';
        audioPlayer.style.display = 'none';

        //if this is a HLS manifest, simply insert the URL
        //Safari supports .m3u8 but Firefox does not
        if (videodata[i]['type'] = 'hlsManifestUrl'){
            videoPlayer.src = videodata[i]['url'];
        }

        //if this is a DashManifest then more work is required
    }
    else{
        //if audio
        let item = videodata[i];
        if (item['mimeType'].includes('audio')){
            videoPlayer.style.display = 'none';
            audioPlayer.style.display = '';
            audioPlayer.src = item['url'];
        }
        //if video
        else{
            audioPlayer.style.display = 'none';
            videoPlayer.style.display = '';
            videoPlayer.src = item['url'];
        }
    }
}

/**
 * Attempts to get the streaming URL from the YouTube Statistics data
 * @param {Object} rawdata JSON struct of the video data
 * @returns {string} the URL of the manifest or undefined if one could not be located
 */
function getManifestURL(rawdata){
    //in order of priority
    let possibilities = ['hlsManifestUrl']; //another type is 'dashManifestUrl' but this system does not support it
    for (let key of possibilities){
        if (rawdata['streamingData'].hasOwnProperty(key)){
            return {'url':rawdata['streamingData'][key], type:key};
        }
    }
    return undefined;
}

/**
 * Loads a resource as plain text
 * @param {string} theUrl the URL to the resource to load
 * @returns {Promise<string>} Resolves with the text on success, rejects on failure
 */
function httpGetPromise(theUrl) {
    return new Promise(function (resolve, reject) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                resolve(xmlHttp.responseText);
        }
        xmlHttp.open("GET", theUrl, true); // true for asynchronous
        xmlHttp.onerror = reject;
        //xmlHttp.setRequestHeader("origin", true);
        xmlHttp.send(null);
    });
}

/**
 * Downloads video information file from YouTube
 * @param {string} id the ID of the video to download data for
 * @returns {Promise<Object>} a parsed struct containing the video information
 */
async function getVideoStats(id) {
    return new Promise(async function (resolve, reject) {
        let res_str = await httpGetPromise(`${cors}https://www.youtube.com/get_video_info?video_id=${id}`);
        let key = "player_response=";
        let idx = res_str.indexOf(key);
        res_str = JSON.parse(decodeURIComponent(res_str.substring(idx + key.length, res_str.indexOf("&", idx))));
        resolve(res_str);
    });
}