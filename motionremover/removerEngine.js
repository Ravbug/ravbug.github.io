var increment = 0.5;

/**
 * Gets a frame at a specified time from a video, as an array[r][g][b][a] in 8-bit color
 * @param {String} path: URL to the video
 * @param {int} secs: timestamp of frame in secs 
 * @param {function} callback: function taking 3 args 
 */
function getVideoImageAsArray(path, secs, callback) {
    var video = document.createElement('video');
    video.src = path;
    if (secs >= video.duration){
        console.log("Skipping out of bounds frame")
        return;
    }
    video.currentTime=secs; 
    //On Frame change
    video.onseeked = function(e) {
        var canvas = document.createElement('canvas');
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        //Get the image data as an array of [r][g][b][a]
        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

        //callback with the array
        callback(imageData,e,video.duration);
    };
    //If there's an error
    video.onerror = function(e) {
        callback.call(this, undefined, undefined, e);
    };
}


/**
 * Converts a video into an array of array of RGBA 
 * @param {int} secs: sec timestamp to start at
 * @param {string} path: path to video
 * @param {function} onComplete: function to call when finished
 */
function decompressVideo(secs,path,onComplete,progress,sequence) {
    getVideoImageAsArray(path,secs,
        function(imgData, event,duration) {
            if (imgData == undefined){
                onComplete(undefined);
                console.log("ERROR: Failed to get video frame. What we know: " + JSON.stringify(duration))
            }
            sequence.push([imgData])
            if (secs < duration){
                decompressVideo(secs+increment,path,onComplete,progress,sequence)
                progress((secs+increment)/duration*100,0)
            }
            //else complete, return decompressed video
            else{
                onComplete(sequence)
            }
        }
        
    );
}

function run(path,progress,complete,onError,mode,quality,vidLength){
    quality = Math.abs(quality);
    console.log("Duration:" + vidLength)
    //determine the increment.
    if (quality <= 0) quality = 1;
    increment = vidLength / quality;

    console.log("Increment = "+increment)
    console.log("Using method " + mode)
     //iteratively call showImage (this loop runs 1 time)
     completeHandler = complete;
     console.log("Decompressing video and sampling frames")
    decompressVideo(1,path,
    function(data){
        if (data == undefined){
            onError("OOF","Could not extract frames from video. \nCheck the console for details.")
            return;
        }
        //update UI
        console.log("Rendering image...")
        progress(0,1);
        var worker = new Worker("removerEngineWorker.js");
        worker.postMessage([data,mode]);
        worker.onmessage = function(e){
            if (e.data[0] == 1){
                 complete(e.data[1]);
                 worker = undefined
            }
            else if (e.data[0] == 0){
                progress(e.data[1],2)
            }
        }
        //setTimeout(function(){renderImage(data,progress,completeHandler,mode);},1000);
    },progress,[]);
    
}