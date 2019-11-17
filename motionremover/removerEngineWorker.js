/**
 * Render a new image from the video data
 * @param {2D array} data: array[frame][image data]
 * @param {*} method: Use Mean, median, or mode for solving
 */
function renderImage(data,method){
    var newImg = [];

    //get all the channel values into an array
    //sort and find median
    //repeat for all the other frames
    var tex_size = data[0][0].length;
    var medians = new Uint8ClampedArray(tex_size);

    //to avoid spamming the console
    var printAmount = Math.floor(tex_size/20);
    //for every pixel
    for (var i = 0; i < tex_size; i++){
        //for every frame
        medianPixel = [];
        for (var inset of data){
            for (var frame of inset){
                medianPixel.push(frame[i])
            }
        }
      
        
        //calculate the apropriate value
        switch (method){
            case 0:
                medians[i] = mean(medianPixel); break;
            case 1:
                medians[i] = median(medianPixel,false); break;
            case 2:
                medians[i] = mode(medianPixel); break;
            case 3:
                medians[i] = adaptive(medianPixel); break;
        }

        //update bar (every 5K iterations because updates are laggy)
        if (i % printAmount == 0){
            postMessage([0,(i / tex_size)*100])
        }
        
    }

    console.log("Render complete!")   
    postMessage([1,medians]);
}

/**
 * Calculates the median value of an array of numbers
 * Most effective on varying types of footage 
 * @param {array(int)} array: array to calculate median
 * @param {Boolean} skipSort: skip the sort operation, the data is already sorted
 * @return: Median of the array 
 */
function median(array,skipSort){
    if (!skipSort){    array.sort(); }
    /*if (array.length % 2 == 0){
        return mean([Math.floor(array.length/2),Math.floor(array.length/2+1)]);
    }*/
    return array[Math.floor(array.length/2)]
}

/**
 * Calculates the mean of the values in the array
 * Not really useful except to blend frames together
 * @param {array(int)} array 
 * @return: mean (rounded int) of the array
 */
function mean(array){
    var sum = 0;
    for (var value of array){
        sum += value;
    }
    return Math.floor(sum / array.length);
}

/**
 * Calcuates the mode of the values in the array. Returns last mode if there are multiple.
 * Works best on synthetic footage
 * @param {*} array: array to find mode
 * @return: the first mode discovered
 */
function mode(numbers) {
    // as result can be bimodal or multi-modal,
    // the returned result is provided as an array
    // mode of [3, 5, 4, 4, 1, 1, 2, 3] = [1, 3, 4]
    var count = [], i, number, maxCount = 0, mostCommon = 0;
 

    //calculate frequency
    for (i = 0; i < numbers.length; i += 1) {
        number = numbers[i];
        var val = count[number];
        val = (val || 0) + 1;

        if (val > maxCount) {
            maxCount = val;
            mostCommon = number;
        }
        count[number] = val;
    }

    return mostCommon;
} 

onmessage = function(e){
    renderImage(e.data[0],e.data[1]);
}

function adaptive(array){
    //calculate IQR
    array.sort();
    var temp = array.slice(0,array.length);
    var min = array[0];
    var max = array[array.length-1];
    var Q1 = median(array.splice(0,array.length/2),true);
    var Q3 = median(array,true);
    var IQR = Math.abs(Q3-Q1);
    //Calculate IQR-Range 
    var ratio = IQR/(max-min);
   if (ratio < 0.8){
       return median(temp,true);
   }
   else{
       return mode(temp);
   }
  // return ratio;
}