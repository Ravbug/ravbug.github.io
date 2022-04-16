const isIOS = !(
    navigator.userAgent.match(/(iPod|iPhone|iPad)/) &&
    navigator.userAgent.match(/AppleWebKit/)
);

let mostRecentPos = undefined; 
let currentVelocity = {x:0, y:0, z:0};
let absoluteSpeed = 0;
let currentHeading = 0;
let headingReference = 0;

const nVelSamples = 50;

let accelBuffer = []

let hasBegunWalking = undefined;

const instructionLabel = document.getElementById("instr");

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
            if (PosError.code == 1){
                alert("Could not read GPS: Permission denied")
            }
            else{
                console.error(`Failed to get geolocation info, error = ${PosError.message}`)
            }
        })
    }
    else{
        alert("GPS is not supported in this browser")
    }
   

    // start game loop
    instructionLabel.innerHTML = "Choose a direction"
    document.getElementById("beginBtn").hidden = true;
    document.getElementById("confirmBtn").hidden = false;
    tick();
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
    mostRecentPos = geoloc;
    document.getElementById("out").innerHTML = `${mostRecentPos.coords.latitude},${mostRecentPos.coords.longitude}`
}

/**
 * Called on accelerometer updates
 * @param {DeviceMotionEvent} evt - containing acceleration and time information
 */
function MotionHandler(evt){
    if (headingReference == 0){
        return;
    }

    function recordAccel(){
        accelBuffer.push({...evt.acceleration,time:evt.timeStamp})
        if(accelBuffer.length > nVelSamples){
            accelBuffer.shift(1);    
        }
    }
    recordAccel();
   
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

    if (absoluteSpeed > 0.2){
        // angle between vectors 
        let unitVec = {x:0, z:1};

        // theta = cos^-1((x dot y) / (||x|| * ||y||))
        //let currentVelAngle = Math.acos((avgVel.x * unitVec.x + avgVel.z * unitVec.z)/(Math.sqrt(avgVel.x * avgVel.x + avgVel.z * avgVel.z)));
        //currentVelAngle = currentVelAngle * 360/Math.PI;
        //document.getElementById("headingImg").style.transform = `rotate(${currentVelAngle}deg)`
    }
    
    if (absoluteSpeed > 0.2 && accelBuffer.length == nVelSamples && !hasBegunWalking){
        hasBegunWalking = Date.now();
        instructionLabel.innerHTML = "Continue walking in this direction for as long as you can!"
        //TODO: decide the reference direction here
    }
    
    // 2 seconds must pass before ending the game
    if (absoluteSpeed < 0.05 && hasBegunWalking && Date.now() - hasBegunWalking > 2000){
        // game over!
        instructionLabel.innerHTML = "Game Over!"
        // remove event handlers
        window.removeEventListener('devicemotion',MotionHandler);
        window.removeEventListener('deviceorientation',OrientationHandler);
        //window.removeEventListener('deviceorientationabsolute',);
        navigator.geolocation.clearWatch(GeoLocationHandler);
    }
}

function tick(){

    setTimeout(tick, 500);
}