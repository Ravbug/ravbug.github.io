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
    }
    else{
        // for non-iOS browsers:     
        window.addEventListener("deviceorientationabsolute", OrientationHandler, true);
    }

    // initialize GPS
    navigator.geolocation.watchPosition(GeoLocationHandler,PosError => {
        console.error(`Failed to get geolocation info, error = ${PosError}`)

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
}

function tick(){
    
    if (mostRecentPos){
        document.getElementById("out").innerHTML = `${mostRecentPos.coords.latitude},${mostRecentPos.coords.longitude}`
    }

    setTimeout(tick, 500);
}