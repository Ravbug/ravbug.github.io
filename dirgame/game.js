const isIOS = !(
    navigator.userAgent.match(/(iPod|iPhone|iPad)/) &&
    navigator.userAgent.match(/AppleWebKit/)
);

function start(){
    // initialize compass and GPS
    if (true){
        DeviceOrientationEvent.requestPermission().then(response => {
            if (response === "granted"){
                window.addEventListener("deviceorientation", OrientationHandler, true);
            }
            else{
                alert("You must enable compass permissions to play this game!")
            }
        });
        if (!navigator.geolocation){
            alert("Your browser does not have GPS capabilities, try using a (newer) mobile device")
        }
        else{
            getLocation();
        }
    }
    else{
        // for non-iOS browsers:     
        window.addEventListener("deviceorientationabsolute", OrientationHandler, true);
    }
   

}

function OrientationHandler(e){
    let compass = e.webkitCompassHeading || Math.abs(e.alpha - 360);
    document.getElementById("out").innerHTML = compass;
    document.getElementById("compassImg").style.transform = `rotate(${-compass}deg)`
    //console.log(compass);
    /// compassCircle;
}

function getLocation() {
    let position = undefined;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {position = pos});
    } else { 
        alert("geoLocation failed")
    }
    return position;
}