const allowed_subs = [
    "all",
    "ask",
    "okbuddyhetero",
    "specializedtools",
    "cursedcomments",
    "holdup",
    "okbuddyretard",
    "196",
    "fuckyouinparticular",
    "IdiotsFightingThings",
    "redneckengineering",
    "rimjob_steve",
    "ShowerThoughts",
    "TerminallyStupid",
    "youngpeopleyoutube",
    "memes",
    "dankmemes",
]

async function httpget(url){
    let temp = undefined;
    await fetch(url).then(response => response.json()).then(data=>{temp=data});
    return temp
}

function getRandom(min, max){
	return parseInt(Math.random() * (max-min) + min);
}

function randomElement(arr){
    const i = getRandom(0,arr.length);
    return arr[i];
}

function shuffle(array) {
    var currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }

async function do_round(){
    // reset UI
    const nextbtn = document.getElementById("nextbtn");
    const checkbtn = document.getElementById("checkbtn")
    checkbtn.hidden = true
    nextbtn.hidden = true
    const verdict = document.getElementById("verdict")
    verdict.hidden = true

    const gamecontainer = document.getElementById("container")
    gamecontainer.style.opacity = 0

    const progressbar = document.getElementById("loadingbar")
    loadingbar.value = 0;
    const progresscontainer = document.getElementById("progresscontainer")
    progresscontainer.style.opacity = 1

    const allCards = document.querySelectorAll(".card");
    for (let card of allCards){
        card.classList.remove("incorrect");
        card.classList.remove("correct");
    }
    verdict.classList.remove("correct")
    verdict.classList.remove("incorrect")

    // get the top posts on the subreddit
    const selected_posts = []

    for(let i = 0; i < 3; i++){
        const subreddit = randomElement(allowed_subs)
        const posts = await httpget(`https://www.reddit.com/r/${subreddit}/.json?count=100`);
        progressbar.value += 25
        
        // select a post
        const post = randomElement(posts["data"]["children"])
        selected_posts.push(post["data"])
    }

    // select a post to get the comment from
    const post = randomElement(selected_posts);

    // get the comment
    const commentdata = await httpget(`https://www.reddit.com${post["permalink"]}.json`);
    const comment = randomElement(commentdata[1]["data"]["children"])["data"]
    progressbar.value += 25
    // present to the user
    document.getElementById("quote").innerHTML = `${comment["body"]}`
    document.getElementById("author").innerHTML = `u/${comment["author"]}`
    gamecontainer.style.opacity = 1
    progresscontainer.style.opacity = 0


    shuffle(selected_posts)
    const titleradios = []
    for(let i = 1; i <= 3; i++){
        {
            const radio = document.getElementById(`post${i}`);
            radio.innerHTML = selected_posts[i-1]["title"];
        }
        const rbtn = document.getElementById(`p${i}`)
        rbtn.post = selected_posts[i-1]
        titleradios.push(rbtn)
    }
    shuffle(selected_posts)
    const subradios = []
    for(let i = 1; i <= 3; i++){
        {
            const radio = document.getElementById(`sub${i}`)
            radio.innerHTML = selected_posts[i-1]["subreddit"];
        }

        const rbtn = document.getElementById(`s${i}`)
        rbtn.post = selected_posts[i-1]
        subradios.push(rbtn)
    }

    checkbtn.hidden = false
    checkbtn.onclick = function(){
        // check the title
        let correcttitle = false
        for(let radio of titleradios){
            if(radio.post === post){
                if (radio.checked){
                    correcttitle = true;
                }
                radio.parentElement.classList.add("correct") 
            }
            else if (radio.checked){
                radio.parentElement.classList.add("incorrect") 
            }
        }

        // check the subreddit
        let correctsub = false
        for(let radio of subradios){
            if(radio.post === post){
                if (radio.checked){
                    correctsub = true;
                }
                radio.parentElement.classList.add("correct") 
            }
            else if (radio.checked){
                radio.parentElement.classList.add("incorrect") 
            }
        }

        // is the user correct?
        verdict.hidden = false
        if (correcttitle && correctsub){
            verdict.innerHTML = "Correct!"
            verdict.classList.add("correct")
        }
        else{
            verdict.innerHTML = "Oops!"
            verdict.classList.add("incorrect")
        }

        // enable the next button
        nextbtn.hidden = false
        checkbtn.hidden = true
    }

}