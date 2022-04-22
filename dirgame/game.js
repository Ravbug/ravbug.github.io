/*
Sensors and their uses:
Compass: indicate heading w/ device orientation
Accelerometer: detect when the player starts moving
GPS: determine path, speed, and when the game should end
*/

let mostRecentPos = undefined; 
let currentVelocity = {x:0, y:0, z:0};
let absoluteSpeed = 0;
let currentHeading = 0;
let headingReference = 0;

const nVelSamples = 50;
let accelBuffer = []
let hasBegunWalking = undefined;

// stores GPS info
let breadcrumb = [];

const instructionLabel = document.getElementById("instr");
const map = document.getElementById("simpleMap")

function UseOrientationEvent(){
    try{
        DeviceOrientationEvent;
        try{
            if(DeviceOrientationEvent.hasOwnProperty("requestPermission")){
                return true;
            }
            return false;
        }
        catch(e){
            return false;
        }
    }
    catch(e){
        return false;
    }
}

function start(){
    if (!navigator.geolocation){
        alert("Your browser does not have GPS capabilities, try using a (newer) mobile device")
        return;
    }
    // initialize compass
    if (UseOrientationEvent()){
        try{
            DeviceOrientationEvent.requestPermission().then(response => {
                if (response === "granted"){
                    window.addEventListener("deviceorientation", OrientationHandler);
                }
                else{
                    alert("You must enable compass permissions to play this game!")
                    return;
                }
            });
        }
        catch(e){
            alert("Your browser does not support DeviceOrientation - Compass will be disabled.")
        }
    }
    else{
        // for non-iOS browsers:     
        window.addEventListener("deviceorientationabsolute", OrientationHandler, true);
    }

     // initialize accelerometer
     try{
        if (DeviceMotionEvent.hasOwnProperty("requestPermission")){
            DeviceMotionEvent.requestPermission().then(response => {
                if (response === 'granted') {
                    window.addEventListener('devicemotion', MotionHandler);
                }
                else{
                    alert("You must enable accelerometer permissions to play this game!");
                }
            });
        }
        else{
            // non-iOS browsers
            window.addEventListener('devicemotion', MotionHandler);
        }
    }
    catch(e){
        alert("Your browser does not support DeviceMotionEvent - Try using a (newer) mobile device")
    }

    // initialize GPS
    if (navigator.geolocation){
        // global variable on purpose
        watchID = navigator.geolocation.watchPosition(GeoLocationHandler,PosError => {
            switch(PosError.code){
                case GeolocationPositionError.PERMISSION_DENIED:
                    alert(`Could not read GPS: ${PosError.message}. To fix, Please go to Settings -> Privacy -> Location Services -> Safari Websites and allow location access.`)
                    break;
                case GeolocationPositionError.POSITION_UNAVAILABLE:
                    console.error(`Location unavailable (${PosError.message})`);
                    break;
                case GeolocationPositionError.TIMEOUT:
                    console.error(`Location request timed out (${PosError.message})`);
                    break;
                case GeolocationPositionError.UNKNOWN_ERROR:
                    console.error(`GPS: unknown error (${PosError.message})`);
                    break;
                default:

            }
        },{maximumAge:0,enableHighAccuracy:true,timeout:1000})
    }
    else{
        alert("GPS is not supported in this browser")
        return;
    }
   

    // start game loop
    instructionLabel.innerHTML = "First, choose a direction"
    document.getElementById("beginBtn").style.display = "none";
    document.getElementById("confirmBtn").style.display = "";
}

function confirmDirection(){
    headingReference = currentHeading;
    instructionLabel.innerHTML = "Start walking!";
    document.getElementById("compassImg").src = "arrow.svg";
    document.getElementById("compassImg").style.filter = `opacity(0.5) invert(50%) sepia(100%) saturate(600%)`
    document.getElementById("confirmBtn").style.display = "none";
    document.getElementById("reloadBtn").style.display = "";
    document.getElementById("headingImg").style.display = "";
    document.getElementById("headingImg").style.filter = "opacity(0.5)";
}

/**
 * Called on compass changes
 * @param {DeviceOrientationEvent} e - containing compass heading information
 */
function OrientationHandler(e){
    currentHeading = e.webkitCompassHeading || Math.abs(e.alpha - 360);
    document.getElementById("compassImg").style.transform = `rotate(${-(currentHeading - headingReference)}deg)`
}

/**
 * Called on GPS updates
 * @param {GeolocationPosition} geoloc - contains latlong information
 */
function GeoLocationHandler(geoloc){
    if (hasBegunWalking){
        mostRecentPos = geoloc;
        breadcrumb.push(geoloc);

        // calculate bounds
        const bbmin = {lat:breadcrumb[0].coords.latitude,long:breadcrumb[0].coords.longitude}
        const bbmax = {lat:breadcrumb[0].coords.latitude,long:breadcrumb[0].coords.longitude}
        for(const point of breadcrumb){
            if (point.coords.latitude < bbmin.lat){
                bbmin.lat = point.coords.latitude;
            }
            if (point.coords.latitude > bbmax.lat){
                bbmax.lat = point.coords.latitude;
            }

            if (point.coords.longitude < bbmin.long){
                bbmin.long = point.coords.longitude;
            }
            if (point.coords.longitude > bbmax.long){
                bbmax.long = point.coords.longitude;
            }
        }
        // generate points
        map.innerHTML = "";
        document.getElementById("latDist").innerHTML = `Scale: ${(distance(bbmin.lat,bbmin.long,bbmax.lat,bbmin.long)*1000).toFixed(1)}m`
        document.getElementById("longDist").innerHTML = `Scale: ${(distance(bbmin.lat,bbmin.long,bbmin.lat,bbmax.long)*1000).toFixed(1)}m`
        {
            let i = 0;
            for(const point of breadcrumb){
                const newLat = rangeRemap(point.coords.latitude,bbmin.lat,bbmax.lat,0,100);
                const newLong = rangeRemap(point.coords.longitude,bbmin.long,bbmax.long,0,100);
                map.innerHTML += `<div class="dot ${i == breadcrumb.length - 1 ? "newest" : ""}" style=top:${newLat}%;left:${newLong}%></div>`;
                i++;
            }
        }

        instructionLabel.innerHTML = `Continue walking in this direction for as long as you can!<br>Try to keep the arrows aligned<br>Distance traveled: ${totalDist().toFixed(1)}m`

        // figure out the current heading from the last 3 latlongs
        if (breadcrumb.length > 6){
            document.getElementById("simpleMap").style.display = ""
            document.getElementById("reloadBtn").style.display = "none";
            document.getElementById("endGameBtn").style.display = "";

            // calculate the initial heading from the first 6 coordinates: avg
            let heading = {lat:0,long:0}
            for(let i = 0; i < 6; i++){
                heading.lat += breadcrumb[i].coords.latitude - breadcrumb[i+1].coords.latitude 
                heading.long += breadcrumb[i].coords.longitude - breadcrumb[i+1].coords.longitude 
            }
            heading.lat /= 6;
            heading.long /= 6;

            // analyze coords 
            if (Date.now() - hasBegunWalking > 2000){

                // was there a sudden change in direction? if so, game over
                let currentHeading = {lat:0,long:0}
                for(let i = breadcrumb.length - 2; i < breadcrumb.length - 1; i++){
                    currentHeading.lat += breadcrumb[i].coords.latitude - breadcrumb[i+1].coords.latitude 
                    currentHeading.long += breadcrumb[i].coords.longitude - breadcrumb[i+1].coords.longitude 
                }
                currentHeading.lat /= 2;
                currentHeading.long /= 2;

                // angle between vectors

                function angleBetween(v1, v2){
                    function vlen(v){
                        return Math.sqrt(v.lat*v.lat + v.long*v.long)
                    }
                    function dot(v1,v2){
                        return v1.lat * v2.lat + v1.long * v2.long;
                    }
                    return Math.acos(dot(v1,v2)/(vlen(v1)*vlen(v2)))
                }
                const angle = angleBetween(heading, currentHeading);
                document.getElementById("headingImg").style.transform = `rotate(${angle * 180/Math.PI}deg)`

                if (angle > (20 * Math.PI/180)){  // 20 degrees in radians
                    gameOver();
                }
            }
        }
    }
}

/**
 * Called on accelerometer updates
 * @param {DeviceMotionEvent} evt - containing acceleration and time information
 */
function MotionHandler(evt){
    if (headingReference == 0){
        return;
    }

    accelBuffer.push({...evt.acceleration,time:evt.timeStamp})
    if(accelBuffer.length > nVelSamples){
        accelBuffer.shift(1);    
    }
   
    currentVelocity.x = 0;
    currentVelocity.y = 0;
    currentVelocity.z = 0;

    // do some rough calculus to calculate velocity over samples - riemann sum of accelerations
    for(let i = 0; i < accelBuffer.length-1; i++){
        const timeDiff = (accelBuffer[i+1].time - accelBuffer[i].time)/1000;
        currentVelocity.x += accelBuffer[i].x * timeDiff;
        currentVelocity.y += accelBuffer[i].y * timeDiff;
        currentVelocity.z += accelBuffer[i].z * timeDiff;
    }

    absoluteSpeed = Math.sqrt(currentVelocity.x * currentVelocity.x + currentVelocity.z * currentVelocity.z + currentVelocity.y * currentVelocity.y)

    if (absoluteSpeed > 0.2 && accelBuffer.length == nVelSamples && !hasBegunWalking){
        hasBegunWalking = Date.now();
        instructionLabel.innerHTML = "Continue walking in this direction for as long as you can!<br>Try to keep the arrows aligned"
        accelBuffer = undefined;    // release this array
        // accelerometer is now useless so no need to keep monitoring it
        window.removeEventListener('devicemotion',MotionHandler);
    }
}

// https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
/**
 * @param {Number} lat1 latitude of point 1
 * @param {Number} lon1 longitude of point 1
 * @param {Number} lat2 latitude of point 2
 * @param {Number} lon2 longitude of point 2
 * @returns the spherical distance between two points
 */
function distance(lat1, lon1, lat2, lon2) {
    var p = 0.017453292519943295;    // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p)/2 + 
            c(lat1 * p) * c(lat2 * p) * 
            (1 - c((lon2 - lon1) * p))/2;

    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

/**
 * @returns Distance between endpoints on the breadcrumb
 */
function totalDist(){
    // convert to meters
    const dist = distance(breadcrumb[0].coords.latitude,breadcrumb[0].coords.longitude,breadcrumb[breadcrumb.length-1].coords.latitude,breadcrumb[breadcrumb.length-1].coords.longitude) * 1000;
    return dist;
}

/**
 * Invoke when the game has ended
 */
function gameOver(){
     // game over!

     // total score is the distance traveled between the first point and the final point
    // convert to meters
    const dist = totalDist();

    instructionLabel.innerHTML = `Game Over!<br>You traveled: ${totalDist().toFixed(1)}m`
    document.getElementById("glyphContainer").hidden = true;
    document.getElementById("reloadBtn").style.display = "";
    document.getElementById("reloadBtn").innerHTML = "Play Again!"
    document.getElementById("endGameBtn").style.display = "none";
    // remove event handlers
    window.removeEventListener('deviceorientation',OrientationHandler);
    window.removeEventListener('deviceorientationabsolute',OrientationHandler);
    navigator.geolocation.clearWatch(watchID);

    // embed the map
    const queryargs = [];
    const avg = {lat:0,long:0}
    let count = 0;
    for(const point of breadcrumb){
        avg.lat += point.coords.latitude
        avg.long += point.coords.longitude
        count++;
        let type;
        if (count == 1){
            type = "flag"
        }
        else{
            type = "vkgrm"
        }
        queryargs.push(`${point.coords.longitude.toFixed(4)},${point.coords.latitude.toFixed(4)},${type}`)
    }
    avg.lat /= count;
    avg.long /= count;
    const url = `https://static-maps.yandex.ru/1.x/?lang=en-US&ll=${avg.long.toFixed(4)},${avg.lat.toFixed(4)}&z=17&l=map&size=450,450&pt=${queryargs.join('~')}`
    document.getElementById("mapRegion").innerHTML = `<img src="${url}" style="width:100%;"><br>Disclaimer - this game uses Yandex Maps to display your route because it is the only service that allows you to plot points without paying for a license. This is not support for Russia.`
}

/**
 * Convert a value from one scale to another
 * @param {Number} value the value on scale of [low1, high1]
 * @param {Number} low1 the min of the range of value
 * @param {Number} high1 the max of the range of value
 * @param {Number} low2 the min of the new range
 * @param {Number} high2 the max of the new range
 * @return value remapped to [low2,high2]
 */
function rangeRemap(value,low1,high1,low2,high2){
    return low2 + (value - low1) * (high2 - low2) / (high1 - low1);
}