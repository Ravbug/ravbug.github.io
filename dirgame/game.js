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
                return;
            }
        });
        if (!navigator.geolocation){
            alert("Your browser does not have GPS capabilities, try using a (newer) mobile device")
            return;
        }
    }
    else{
        // for non-iOS browsers:     
        window.addEventListener("deviceorientationabsolute", OrientationHandler, true);
    }
    // start game loop
    tick();

}

function OrientationHandler(e){
    let compass = e.webkitCompassHeading || Math.abs(e.alpha - 360);
    document.getElementById("compassImg").style.transform = `rotate(${-compass}deg)`
    //console.log(compass);
    /// compassCircle;
}

function tick(){
    let position = undefined;
    navigator.geolocation.getCurrentPosition(pos => {position = pos});

    document.getElementById("out").innerHTML = position;
    console.log(position);
    setTimeout(tick, 500);
}