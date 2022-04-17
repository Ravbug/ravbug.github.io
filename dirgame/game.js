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

function start(){
    // initialize compass
    if (true){
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
            if (!navigator.geolocation){
                alert("Your browser does not have GPS capabilities, try using a (newer) mobile device")
                return;
            }
        }
        catch(e){
            alert("Your browser does not support DeviceOrientation - Compass will be disabled.")
        }
        
        // initialize accelerometer
        try{
            DeviceMotionEvent.requestPermission().then(response => {
                if (response === 'granted') {
                    window.addEventListener('devicemotion', MotionHandler);
                }
                else{
                    alert("You must enable accelerometer permissions to play this game!");
                }
            });
        }
        catch(e){
            alert("Your browser does not support DeviceMotionEvent - Try using a (newer) mobile device")
        }
    }
    else{
        // for non-iOS browsers:     
        window.addEventListener("deviceorientationabsolute", OrientationHandler, true);
    }

    // initialize GPS
    if (navigator.geolocation){
        navigator.geolocation.watchPosition(GeoLocationHandler,PosError => {
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
    instructionLabel.innerHTML = "Choose a direction"
    document.getElementById("beginBtn").hidden = true;
    document.getElementById("confirmBtn").hidden = false;
}

function confirmDirection(){
    headingReference = currentHeading;
    instructionLabel.innerHTML = "Start walking!";
    document.getElementById("compassImg").src = "arrow.svg";
    document.getElementById("confirmBtn").hidden = true;
    document.getElementById("headingImg").hidden = false;
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
        document.getElementById("out").innerHTML = `${mostRecentPos.coords.latitude},${mostRecentPos.coords.longitude}`


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
        {
            let i = 0;
            for(const point of breadcrumb){
                const newLat = rangeRemap(point.coords.latitude,bbmin.lat,bbmax.lat,0,100);
                const newLong = rangeRemap(point.coords.longitude,bbmin.long,bbmax.long,0,100);
                map.innerHTML += `<div class="dot ${i == breadcrumb.length - 1 ? "newest" : ""}" style=top:${newLat}%;left:${newLong}%></div>`;
                i++;
            }
        }

        // figure out the current heading from the last 3 latlongs
        if (breadcrumb.length > 6){
            // calculate the initial heading from the first 6 coordinates
            

            // analyze coords 
            if (Date.now() - hasBegunWalking > 2000){

                // was there a sudden change in direction? if so, game over
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
    document.getElementById("out2").innerHTML = `x=${currentVelocity.x.toFixed(2)}<br>y=${currentVelocity.y.toFixed(2)}<br>z=${currentVelocity.z.toFixed(2)}<br>speed=${absoluteSpeed.toFixed(2)}`;

    if (absoluteSpeed > 0.2 && accelBuffer.length == nVelSamples && !hasBegunWalking){
        hasBegunWalking = Date.now();
        instructionLabel.innerHTML = "Continue walking in this direction for as long as you can!"
        accelBuffer = undefined;    // release this array
        // accelerometer is now useless so no need to keep monitoring it
        window.removeEventListener('devicemotion',MotionHandler);
    }
}

function gameOver(){
     // game over!
     instructionLabel.innerHTML = "Game Over!"
     // remove event handlers
     window.removeEventListener('deviceorientation',OrientationHandler);
     //window.removeEventListener('deviceorientationabsolute',);
     navigator.geolocation.clearWatch(GeoLocationHandler);
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