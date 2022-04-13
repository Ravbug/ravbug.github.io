const isIOS = !(
    navigator.userAgent.match(/(iPod|iPhone|iPad)/) &&
    navigator.userAgent.match(/AppleWebKit/)
);

let mostRecentPos = undefined; 
let currentVelocity = {x:0, z:0};
let prevAccel = {x:0,z:0,time:0};
let absoluteSpeed = 0;
let currentHeading = 0;
let headingReference = 0;

let velAvg = []

const instructionLabel = document.getElementById("instr");

function start(){
    // initialize compass
    if (true){
        try{
            DeviceOrientationEvent.requestPermission().then(response => {
                if (response === "granted"){
                    window.addEventListener("deviceorientation", OrientationHandler, true);
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
    navigator.geolocation.watchPosition(GeoLocationHandler,PosError => {
        if (PosError.code == 1){
            alert("Could not read GPS: Permission denied")
        }
        else{
            console.error(`Failed to get geolocation info, error = ${PosError.message}`)
        }
    })

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
    if (prevAccel.time == 0){
        prevAccel.x = evt.acceleration.x;
        prevAccel.z = evt.acceleration.z;
        prevAccel.time = evt.acceleration.time;
    }
    else{
        currentVelocity.x = (evt.acceleration.x - prevAccel.x) * (evt.timeStamp - prevAccel.time);
        currentVelocity.z = (evt.acceleration.z - prevAccel.z) * (evt.timeStamp - prevAccel.time);

        // running avg
        velAvg.push({...currentVelocity})
        if(velAvg.length > 10){
            velAvg.shift(1);    
        }

        prevAccel.x = evt.acceleration.x;
        prevAccel.z = evt.acceleration.z;
        prevAccel.time = evt.timeStamp;
    }

    let avgVel = {x:0, z:0}
    for(let i = 0; i < velAvg.length; i++){
        avgVel.x += velAvg[i].x;
        avgVel.z += velAvg[i].z;
    }
    avgVel.x /= velAvg.length;
    avgVel.z /= velAvg.length;

    if (Math.abs(velAvg.x) < 0.3){
        velAvg.x = 0;
    }
    if (Math.abs(velAvg.z) < 0.3){
        velAvg.z = 0;
    }

    absoluteSpeed = Math.sqrt(avgVel.x * avgVel.x + avgVel.z * avgVel.z)
    document.getElementById("out2").innerHTML = `x=${avgVel.x.toFixed(2)}<br>z=${avgVel.z.toFixed(2)}<br>speed=${absoluteSpeed.toFixed(2)}`;

    if (absoluteSpeed > 0.2){
        // angle between vectors 
        let unitVec = {x:0, z:1};

        // theta = cos^-1((x dot y) / (||x|| * ||y||))
        let currentVelAngle = Math.acos((avgVel.x * unitVec.x + avgVel.z * unitVec.z)/(Math.sqrt(avgVel.x * avgVel.x + avgVel.z * avgVel.z)));
        currentVelAngle = currentVelAngle * 360/Math.PI;
        document.getElementById("headingImg").style.transform = `rotate(${currentVelAngle}deg)`
    }
    
}

function tick(){

    setTimeout(tick, 500);
}