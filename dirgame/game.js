const isIOS = !(
    navigator.userAgent.match(/(iPod|iPhone|iPad)/) &&
    navigator.userAgent.match(/AppleWebKit/)
);

let mostRecentPos = undefined; 

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
    tick();

}

function OrientationHandler(e){
    let compass = e.webkitCompassHeading || Math.abs(e.alpha - 360);
    document.getElementById("compassImg").style.transform = `rotate(${-compass}deg)`
    //console.log(compass);
    /// compassCircle;
}

function GeoLocationHandler(geoloc){
    mostRecentPos = geoloc;
    document.getElementById("out").innerHTML = `${mostRecentPos.coords.latitude},${mostRecentPos.coords.longitude}`
}

function MotionHandler(evt){
    document.getElementById("out2").innerHTML = `x=${evt.acceleration.x},y=${evt.acceleration.y},z=${evt.acceleration.x}`;
}

function tick(){

    setTimeout(tick, 500);
}