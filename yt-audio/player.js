let player;
  let playpause = document.getElementById('playpause')
  let playhead = document.getElementById('playhead');
  let time = document.getElementById("time");
  let ctime = document.getElementById("ctime");
  let volslider = document.getElementById("volslider");
  let nameFieled = document.getElementById('name');

  let startVidId = "";
  let startPlId = "";
  let startplidx = 0;

  //video looping, not a provided feature of embed api
  let loop = true;
  toggleLoop(document.getElementById('loopbtn'));
  //read the URL arguments
  {
    let argdict = urlArgsAsDict();
    //load the initial video
    startVidId = argdict["v"];
    //load the initial playlist
    try {
        startPlId = getYoutubePlaylistId(argdict['pl']);
        startplidx = argdict['i'];
      
    } catch (e) { 
      startVidId = YouTubeGetID(startVidId);
    }
  }

  // Replace the 'ytplayer' element with an <iframe> and
  // YouTube player after the API code downloads.
  function onYouTubePlayerAPIReady() {
    if (startVidId != ""){
        player = new YT.Player('ytplayer', {
            height: '50',
            width: '50',
            videoId: startVidId,
            events: {
              'onReady': onPlayerReady,
              'onStateChange': onPlayerStateChange,
              'onError': onError
            }
          });
    }
    else{
        player = new YT.Player('ytplayer', {
            height: '50',
            width: '50',
            events: {
              'onReady': onPlayerReady,
              'onStateChange': onPlayerStateChange,
              'onError': onError
            }
          });
      loadPlaylist(startPlId);
    }
  }

  function onError(event) {
    let status = event.data;
    if (status == 101 || status == 150) {
      //embedded playback was disabled
      playpause.innerHTML = "🔒";
      alert("The selected video cannot be played outside of YouTube.com")
    }
    if (status == 100) {
      //video cannot be loaded / found
      playpause.innerHTML = "⁉️";
      alert("The selected video could not be found")
    }
    if (status == 5) {
      //HTML5 player had an error
      playpause.innerHTML = "🛑";
      alert("The player errored. Reload the page.")
    }

    if (status == 2) {
      //Invalid parameter
      playpause.innerHTML = "⚠️"
      alert("Invalid parameter")
    }
  }

  function loadVideo(id) {
    player.loadVideoById(id);
  }

  function loadPlaylist(id) {
    startPlId = id;
    player.loadPlaylist({ list: id, listType: "playlist", index: startplidx })
  }

  //on player load
  function onPlayerReady(event) {
    //load playlist if one is specified
    if (startPlId != undefined) { loadPlaylist(startPlId) }
    else{
      player.playVideo();
    }
    //update volume slider
    document.getElementById("volslider").value = player.getVolume();
  }
  function onPlayerStateChange(event) {
    let state = event.data;
    if (state == YT.PlayerState.PLAYING) {
      playpause.innerHTML = "||";
      updateReadout();
      //start slider update
      playhead.max = player.getDuration();
      playhead.value = player.getCurrentTime()
      startSliderUpdate();
      updateUrlArgs();
    }
    if (state == YT.PlayerState.PAUSED) {
      playpause.innerHTML = "▶";
      //stop slider update
      stopSliderUpdate();
      updateReadout();
    }
    if (state == YT.PlayerState.BUFFERING) {
      playpause.innerHTML = '⏳';
    }
    if (state == YT.PlayerState.ENDED) {
      playpause.innerHTML = '⏮'
      //if loop is enabled, trigger play
      if (loop) {
        player.playVideo();
      }
    }    
  }

  /**
   * Updates the URL arguments, as well as the Now Playing display
   */
  function updateUrlArgs(){
    //Is a playlist loaded?
    let id = player.getPlaylist();
    if (id && id.length > 0){
        //get the playlist url
        //get current playlist id
        let idx = player.getPlaylistIndex();
        writeURLArgs(["pl="+startPlId,"i="+idx]);
        let len = id.length-1;
        id = YouTubeGetID(player.getVideoUrl());
        nameFieled.innerHTML = `Now Playing: Video <a href="https://youtube.com/watch?v=${id}&list=${startPlId}" target="_blank">` + id + `</a> (${idx}/${len})`;
        document.getElementById("title").innerHTML = `YouTube Audio Player (${idx}/${len})`
    }
    else{
        //otherwise video only
        //get the video id
        let id = YouTubeGetID(player.getVideoUrl());
        writeURLArgs(["v="+id]);
        nameFieled.innerHTML = `Now Playing: Video <a href="https://youtube.com/watch?v=${id}" target="_blank">` + id + "</a>";
        document.getElementById("title").innerHTML = `YouTube Audio Player [${id}]`
    }
  }

  //called when play button hit
  function togglePlay(button) {
    player.getPlayerState() == 1 ? player.pauseVideo() : player.playVideo();
  }

  //called when loop is pressed
  function toggleLoop(button) {
    loop = !loop;
    button.innerHTML = loop ? '🔁' : '➡'
  }

  function toggleMute(button) {
    player.isMuted() ? player.unMute() : player.mute();
    if (!player.isMuted()) {
      button.innerHTML = '🔇';
      volslider.disabled = true;
      return;
    }
    else {
      volslider.disabled = false;
      setVolIcon(button);
    }
  }

  function changeVolume(value) {
    document.getElementById("volLabel").innerHTML = `${value}%`;
    player.setVolume(value);
    setVolIcon(document.getElementById('muteBtn'));
  }

  function setVolIcon(button) {
    let vol = player.getVolume();
    if (vol < 20) {
      button.innerHTML = '🔈'
    }
    else if (vol > 80) {
      button.innerHTML = '🔊';
    }
    else {
      button.innerHTML = '🔉'
    }
  }

  //converts seconds to time stamp
  function secToStamp(sec) {
    var date = new Date(null);
    date.setSeconds(sec);
    return date.toISOString().substr(11, 8);
  }

  function updateReadout() {
    time.innerHTML = secToStamp(playhead.max);
    ctime.innerHTML= secToStamp(playhead.value);
  }

  //updating (and stopping updates) to the playhead slider
  var loopID = null;
  function startSliderUpdate() {
    if (loopID == null) {
      loopID = setInterval(function () {
        //update slider
        playhead.value = player.getCurrentTime()
        //update readout
        updateReadout();
      }, 1000)
    }
  }
  function stopSliderUpdate() {
    clearTimeout(loopID);
    loopID = null;
  }

  //called when user presses enter in Jump To video field
  function jumpToVideo() {
    try{
      player.playVideoAt(document.getElementById('jumpto').value);
    }catch(e){offline()}
  }

  //called when user presses enter in play video field
  function playID() {
    try{
      let v = document.getElementById('addvid');
      if (v.value != "") {
        let id = YouTubeGetID(v.value)
        loadVideo(id);
        writeURLArgs(["v="+id]);
        v.value = ''
      }
    }catch(e){offline()}
  }

  //called when user presses enter in playlist field
  function playPlaylist() {
    try{
      let v = document.getElementById('addpl');
      if (v.value != "") {
        let id = getYoutubePlaylistId(v.value);
        loadPlaylist(id);
        writeURLArgs(["pl="+id]);
        v.value = ''
      }
    }catch(e){offline()}
  }


  /**
  * Get YouTube ID from various YouTube URL
  * @param {string} url the URL to extract
  * @attribution: https://gist.github.com/takien/4077195
  */

  function YouTubeGetID(url) {
    var ID = '';
    url = url.replace(/(>|<)/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    if (url[2] !== undefined) {
      ID = url[2].split(/[^0-9a-z_\-]/i);
      ID = ID[0];
    }
    else {
      ID = url;
    }
    return typeof ID == "object"? ID[0] : ID;
  }

  /**
   * Gets a YouTube PlaylistID from different YouTube URLs
   * @param {string} url the URL to extract
   * @attribution: https://github.com/pierreneter-repositories/get-youtube-playlist-id/ (adapted)
   */
  function getYoutubePlaylistId(url) {
    if (!url.includes("http")) {
      return url;
    }
    var id = /[&|\?]list=([a-zA-Z0-9_-]+)/gi.exec(url)
    return (id && id.length > 0) ? id[1] : false
  }

function OnShuffle(button){
    if (button.className == "enabledbtn"){
        button.className = "";
        player.setShuffle(false);
    }
    else{
        button.className = "enabledbtn";
        player.setShuffle(true);
    }
}

function OnLoopPlaylist(button){
    if (button.className == "enabledbtn"){
        button.className = "";
        player.setLoop(false);
    }
    else{
        button.className = "enabledbtn";
        player.setLoop(true);
    }
}


