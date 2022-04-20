// use `delete data` when finished with this array
// this file will remove the script tag that it is loaded in automatically

/* 
 * Contents of each card
 * Title: top text
 * img: image URL (blank for no image)
 * tag: tagline text
 * ref: url to page
 */

/* Contents of each section
 * title: name of section
 * content: array of cards
 */
data = [
        // {
        //     title: "DevBlogs",
        //     content:[
        //         {
        //             title:"RavEngine DevBlog",
        //             img:"img/joystick.svg",
        //             tag:"Recording my progress and thoughts while developing a custom game engine in C++",
        //             ref:"blog/ravengine",
        //         }
        //     ]
        // },
        {
            title:"Games",
            content: [
                {
                    title:"RavEngine",
                    img:"ravbug.png",
                    tag:"Fast and flexible C++ game engine leveraging both OOP and ECS",
                    ref:"https://github.com/Ravbug/RavEngine",
                },
                {
                    title:"Tankista",
                    img:"img/tankista.png",
                    tag:"Mulitplayer tank battle game in development",
                    ref:"https://rrsoftware.github.io",
                },
                {
                    title:"Battle Islands",
                    img: "battle-islands/icon.png",
                    tag: "Build your way to victory in this team survival game!",
                    ref: "battle-islands",
                },
                {
                    title:"Kit Spleef",
                    img: "img/kitspleef.png",
                    tag: "The classic minecraft minigame with a chaotic spin! No player cap.",
                    ref: "kit-spleef",
                },
                {
                    title:"Mastermind",
                    tag:"The classic code-breaking game in your browser",
                    ref:"mastermind/",
                    img:"mastermind/pin.svg"
                },
                {
                    title:"Mastermind Python",
                    img:"img/pygame.png",
                    tag:"The Mastermind game, written in python and pygame",
                    ref:"https://github.com/ravbug/mastermind"
                },
                {
                    title:"Tanks Unreal",
                    tag:"Unity's Tanks! sample rewritten in Unreal C++",
                    ref:"https://github.com/ravbug/TanksUnreal",
                    img:"img/unrealengine.svg"
                },
                {
                    title: "The NPM Drinking Game",
                    tag: "Your liver will not like this",
                    ref:"npm-drinking-game",
                    img:"npm-drinking-game/npm-logo.svg"
                },
                {
                    title: "The PyPi Drinking Game",
                    tag: "Your liver might not like this",
                    ref:"pypi-drinking-game",
                    img:"pypi-drinking-game/pypi-logo.svg"
                },
                {
                    title: "The Cargo Drinking Game",
                    tag: "Your liver might be ok with this",
                    ref:"cargo-drinking-game",
                    img:"cargo-drinking-game/cargo-logo.png"
                },
            ]
        },
        {
            title:"Software",
            content:[
                {
                    title:"Open Source Software",
                    img:"img/github.svg",
                    tag:"View my public open source software repositories",
                    ref:"https://github.com/Ravbug?tab=repositories",
                },
                {
                    title:"wxWidgets Template",
                    img:"img/wxwidgets.svg",
                    tag:"A template project for quickly developing cross-platform native apps in C++",
                    ref:"https://github.com/Ravbug/wxwidgetstemplate",
                },
                {
                    title:"FatFileFinder",
                    img: "img/broom.svg",
                    tag: "A fast, native cross platform disk sweeper written in C++",
                    ref: "fatfilefinder/",
                },
                {
                    title:"Unity Hub Native",
                    tag:"A lighting-fast native rewrite of the Unity Hub in C++",
                    ref:"unityhubnative/",
                    img:"img/unityhubnative.png"
                },
                {
                    title:"Minecraft Sounds Extractor",
                    img:"img/mcextractor.png",
                    tag:"Extract the audio files from Minecraft Java Edition",
                    ref:"mcsounds-extractor/",
                },
                {
                    title:"EmbedBot",
                    img:"img/embedbot.png",
                    tag:"A simple Discord integration for creating better embeds for some websites",
                    ref:"https://embed-bot.vercel.app",
                },
                /*{
                    title:"Cleverbug",
                    img:"https://images-ext-1.discordapp.net/external/FZ6XbC9DP_MCNKIog6TaBwbnO0qIW7mCAd7KGrUGkPs/%3Fsize%3D256/https/cdn.discordapp.com/avatars/374793801455108097/34cd9178a4f93f3dfb14fa55a0f3f74f.png",
                    tag:"A fun chatbot for your Discord server",
                    ref:"https://cleverbug-bot.herokuapp.com"
                },*/
                {
                    title:"AutoResponder",
                    img:"https://images-ext-1.discordapp.net/external/SwQny5232U0cU3rqx9OZcLLucdkjppRcxocu7Dpu1p4/%3Fsize%3D256/https/cdn.discordapp.com/avatars/409947148172394498/7ff43b27f39a267fc9f658cbdf99775f.png",
                    tag:"A customizable, regex-powered responder bot for your Discord server",
                    ref:"https://autoresponder-bot.herokuapp.com",
                },
                {
                    title:"QReaper",
                    tag:"A Discord bot which deletes QR Codes it sees (Self-host only)",
                    ref:"https://github.com/ravbug/qreaper",
                    img:"https://cdn.discordapp.com/avatars/666309507105816586/9e1e20e18619535cbf4f87f454957d5b.png?size=2048"
                },
                {
                    title:"Maya Scripts",
                    img:"img/maya.png",
                    tag:"MEL and Python tools for Autodesk Maya",
                    ref:"maya-scripts/"
                }
            ]
        },
        {
            title:"In Your Browser",
            content:[     
                {
                    title: "WebPhoto",
                    img: "webphoto/icon.svg",
                    tag: "A non-destructive image editor using CSS and SVG filters (beta)",
                    ref: "webphoto/"
                },
                {
                    title:"CodeVisualizer",
                    tag:"A live-updating webpage editor in your browser!",
                    ref:"codevisualizer/",
                    img:"img/code.svg"
                },
                {
                    title:"MarkdownViz",
                    tag:"A live markdown editor in your browser!",
                    ref:"markdownviz/",
                    img:"markdownviz/markdown.svg"
                },
                {
                    title:"Wordle Helper",
                    tag:"A filtering tool to help you play Wordle!",
                    ref:"wordle-help/",
                    img:"wordle-help/wordle.svg"
                },
                {
                    title:"Calculator",
                    tag:"A fast scientific calculator in your browser",
                    ref:"calculator/",
                    img:"calculator/icon.svg"
                },
                {
                    title:"PoetryBot Web",
                    tag:"Writes original poems using the text on webpages",
                    ref:"poetry/",
                    img:"poetry/icon.png"
                },
                {
                    title: "Graphics API support chart",
                    tag: "A table of reliably supported graphics APIs, by platform",
                    ref:"graphics",
                    img:"graphics/gpu.svg"
                },
                {
                    title:"Who's Up?",
                    tag:"Display a graph of the intersection where people are awake in different timezones",
                    ref:"whosup/",
                    img:"whosup/alarmclock.svg"
                },
                /*{
                    title:"Rate My Professors Scraper",
                    img:"img/rmp.png",
                    tag:"Quickly get a list of the best professors for your classes",
                    ref:"rate-my-professors-scraper/",
                },*/
                {
                    title:"Legacy Web Cleverbug",
                    img:"cleverbug-alpha/cleverbot.png",
                    tag:"The webpage-based ancestor to the Cleverbug Discord bot. Source available!",
                    ref:"cleverbug-alpha/"
                },
                /*{
                    title:"Instabook",
                    img:"instabook/encyclopedia.svg",
                    tag:"Get a short blurb about anything",
                    ref:"instabook/",
                },*/
                {
                    title:"Twain's Funetik Alphabet",
                    img:"img/dictionary.svg",
                    tag:"What if English spelling was phonetic?",
                    ref:"tfa/"
                },
                {
                    title:"YouTube Audio Player",
                    img: "yt-audio/yt.svg",
                    tag: "An audio-only player for YouTube videos and playlists. Does not (intentionally) reduce data usage.",
                    ref:"yt-audio/"
                },
                {
                    title:"Article Summarizer",
                    tag:"A clientside text summarizer, using WebWorkers",
                    ref:"summarizer/",
                    img:"img/t_pen.svg"
                },
                {
                    title:"Emojitizer",
                    tag:"Convert text into Emojis like it's the year 2100",
                    ref:"emojitizer/",
                    img:"img/t_100.svg"
                },
                {
                    title:"Hypertranslate",
                    tag:"Play translation telephone with Google Translate",
                    ref:"hypertranslate/",
                    img:"img/googletranslate.svg"
                },
                // {
                //     title:"JConsole",
                //     tag:"An interactive JavaScript playground",
                //     ref:"jconsole/",
                //     img:"img/t_pager.svg"
                // },
                {
                    title:"Motion Remover",
                    tag:"Generate a clean still image from a video by removing the moving objects",
                    ref:"motionremover/",
                    img:"img/t_camera_flash.svg"
                },
                /*{
                    title:"Text Transformer",
                    tag:"Fun typo generator",
                    ref:"texttransformer/",
                    img:"img/t_abc.svg"
                },*/
                {
                    title:"YouTube Thumbnail Downloader",
                    tag:"Download the full-size thumbnail for a YouTube video",
                    ref:"thumbnaildownloader/",
                    img:"img/youtube.svg"
                },
                {
                    title:"Reddit Media Downloader",
                    tag:"Get direct links to reddit video, audio, and images",
                    ref:"redditmedia/",
                    img:"redditmedia/reddit.svg"
                },
                {
                    title: "YouTube Direct Video downloader",
                    tag: "Access the direct high-quality media URLs of YouTube videos",
                    ref: "yt-direct/",
                    img: "yt-direct/icon.svg"
                },
                {
                    title:"Editable BSODs",
                    tag:"An editable Windows blue screen of death, using content-editable divs",
                    ref:"bsod/",
                    img:"img/windows.svg"
                },
                {
                    title:"Discord Block Letters",
                    tag:"Convert text to :regional_indicator: emojis to yell extra loudly in Discord",
                    ref:"discordblockletters/",
                    img:"img/t_regional_s.svg"
                },
                /*{
                    title:"Full Window YouTube",
                    tag:"Scale a YouTube video to fill the whole browser window",
                    ref:"fullwindowvideo/",
                    img:"img/fullscreen.svg"
                },*/
                {
                    title:"Factorizer",
                    tag:"Find factors and common factors of numbers",
                    ref:"factors/",
                    img:"img/t_obelus.svg"
                },
                /*{
                    title:"Random Number Generator",
                    tag:"Generate random numbers in a range and guarantee no repeats",
                    ref:"rng/",
                    img:"img/t_dice.svg"
                },*/
            ]
        },
        {
            title:"Animation",
            content:[
                {
                    title:"YouTube Channel",
                    img:"img/youtube.svg",
                    tag:"Watch my animated short films!",
                    ref:"https://youtube.com/c/ravbuganimations/",
                },
                /*{
                    title:"Public Rigs and Assets Home",
                    img:"",
                    tag:"Home page for my free rigs",
                    ref:"rigs/",
                },*/
                {
                    title:"Minecraft Player / Villager Rig (Maya)",
                    img:"img/mcsteve.png",
                    tag:"An advanced minecraft player and villager combo rig",
                    ref:"rigs/minecraft-player",
                },
                {
                    title:"Minecraft Monster Rigs (Maya)",
                    img:"img/mccreeper.png",
                    tag:"Skeletons, creepers, slimes, etc",
                    ref:"rigs/minecraft-monster",
                },
                {
                    title:"Minecraft Misc Rigs (Maya)",
                    img:"img/mcbook.png",
                    tag:"Books, vehicles, lecterns, etc",
                    ref:"rigs/minecraft-misc",
                },
                {
                    title:"Minecraft Animal Rigs",
                    img:"img/mcsheep.png",
                    tag:"Sheep, wolves, cats, rabbits, etc",
                    ref:"rigs/minecraft-animal",
                },
                {
                    title:"Uncategorized Rigs (Maya)",
                    img:"img/spotlight.svg",
                    tag:"Lighting, etc",
                    ref:"rigs/uncategorized",
                },
                {
                    title:"Legacy Minecraft Villager Rig (Maya)",
                    img:"img/villager.svg",
                    tag:"Villager rig, before it became part of the player rig",
                    ref:"rigs/minecraft-legacy-villager",
                },
                {
                    title:"Legacy Minecraft Slime Rig (Maya)",
                    img:"img/mcslime.png",
                    tag:"Old slime rig with a different design",
                    ref:"rigs/minecraft-legacy-slime",
                },
            ]
        },
        {
            title:"Tutorials",
            content:[
                {
                    title:"CMake Made Easy",
                    img:"tutorials/cmake-easy/cmake_icon.svg",
                    tag:"A simple but effective CMake tutorial for beginners",
                    ref:"tutorials/cmake-easy"
                },
                {
                    title:"Make a GitHub Pull Request",
                    img:"img/github.svg",
                    tag:"A brief and to-the-point tutorial",
                    ref:"tutorials/github-pr"
                },
                {
                    title:"Simulate a Raspberry Pi",
                    img:"tutorials/virtual-rpi/pi.svg",
                    tag:"Emulate a full Raspberry Pi on your PC",
                    ref:"tutorials/virtual-rpi"
                },
                {
                    title:"Vulkan for Raspberry Pi",
                    img:"tutorials/rpi-vulkan/vulkan.svg",
                    tag:"Run the Vulkan API on your Raspberry Pi",
                    ref:"tutorials/rpi-vulkan"
                },
                {
                    title:"Rapid Discord.js tutorial",
                    img:"tutorials/discordjs/discordjs.png",
                    tag:"A condensed Discord.js bot tutorial for experienced developers, includes starter code.",
                    ref:"tutorials/discordjs"
                },
                {
                    title:"Minecraft server without port forwarding",
                    img:"img/server.svg",
                    tag:"Let friends join your Java Edition server without port forwarding using ngrok",
                    ref:"tutorials/mc-ngrok/"
                },
                {
                    title:"How To Extract Minecraft Textures",
                    img:"img/mcpainting.png",
                    tag:"Get the texture files from any minecraft version",
                    ref:"tutorials/mc-textures",
                },
                {
                    title: "Install OptiFine without installing Java",
                    img:"tutorials/optifine-no-java/optifine.png",
                    tag:"Use Minecraft's bundled Java to run the OptiFine installer",
                    ref:"tutorials/optifine-no-java/"
                },
                {
                    title: "Enable Touch Bar Function keys in Minecraft",
                    img:"tutorials/mc-touchbar/touch.svg",
                    tag:"Use the F1, F2, etc keys on the Touch Bar when playing Minecraft Java Edition",
                    ref:"tutorials/mc-touchbar"
                },
                {
                    title:"How to render and composite zDepth",
                    img:"img/layers.svg",
                    tag:"Set up Maya render layers and Nuke nodes for a fast hardware-accelerated depth pass",
                    ref:"tutorials/zdepth",
                },
                {
                    title:"How to use an Xbox Kinect for Motion Capture",
                    img:"img/kinect.svg",
                    tag:"Installation, setup, and usage in Maya and MotionBuilder",
                    ref:"tutorials/kinect-mocap",
                },
                {
                    title:"Disable background Adobe processes on macOS",
                    img:"tutorials/stop-adobe-daemons/no-adobe.svg",
                    tag:"Prevent resource-consuming Adobe background processes from running on your Mac.",
                    ref:"tutorials/stop-adobe-daemons",
                },
                {
                    title:"How to use HIK retargeting",
                    img:"img/mocap.svg",
                    tag:"Using motion capture animation in Maya",
                    ref:"tutorials/hik-retargeting",
                },
                {
                    title: "How to get HEVC support on Windows 10 for free",
                    img: "tutorials/hevc-windows10/extension.png",
                    tag: "Use the hidden free OEM extension",
                    ref: "tutorials/hevc-windows10"
                },
                {
                    title:"Prevent Windows 10 from auto-downloading bloat",
                    img:"tutorials/stop-win10-autodownload/regedit_102.png",
                    tag:"Registry tweaks to prevent Windows from repeatedly installing shovelware without your permission",
                    ref:"tutorials/stop-win10-autodownload"
                }
            ]
        },
        {
            title:"Miscellaneous",
            content:[
                {
                    title: "Minecraft Google Translate Resource Pack",
                    img: "img/googletranslate.svg",
                    tag: "Google Translating all of the game's text too many times",
                    ref: "mc-googletranslate/"
                },
                {
                    title:"Math Demos",
                    img:"img/desmos.png",
                    tag:"Some educational math demos",
                    ref:"math/",
                },
                {
                    title:"Shoddy Tech Drawings",
                    img:"shoddy-drawings/intelhd.png",
                    tag:"Make fun of tech using these crude drawings",
                    ref:"shoddy-drawings/"
                }
            ]
        },
    ]
document.currentScript.remove()