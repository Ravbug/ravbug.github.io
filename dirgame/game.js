const isIOS = !(
    navigator.userAgent.match(/(iPod|iPhone|iPad)/) &&
    navigator.userAgent.match(/AppleWebKit/)
);

let mostRecentPos = undefined; 
let currentVelocity = {x:0, y:0, z:0};
let absoluteSpeed = 0;
let currentHeading = 0;
let headingReference = 0;

const instructionLabel = document.getElementById("compassImg");

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
    document.getElementById("confirmBtn").hidden = true;
    tick();
}

function confirmDirection(){
    headingReference = currentHeading;
    instructionLabel.innerHTML = "Start walking!";
    document.getElementById("compassImg").src = "arrow.svg";
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
    currentVelocity.x += evt.acceleration.x;
    currentVelocity.y += evt.acceleration.y;
    currentVelocity.z += evt.acceleration.z;
    absoluteSpeed = Math.sqrt(currentVelocity.x * currentVelocity.x + currentVelocity.y * currentVelocity.y + currentVelocity.z * currentVelocity.z)
    document.getElementById("out2").innerHTML = `x=${evt.acceleration.x},y=${evt.acceleration.y},z=${evt.acceleration.x}`;
}

function tick(){

    setTimeout(tick, 500);
}