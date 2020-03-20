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
        {
            title:"Software Development",
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
                    ref: "https://github.com/Ravbug/FatFileFinderCPP",
                },
                {
                    title:"Unity Hub Native",
                    tag:"A lighting-fast native rewrite of the Unity Hub in C++",
                    ref:"https://github.com/ravbug/unityhubnative/",
                    img:"img/unityhubnative.png"
                },
                {
                    title:"Tanks Unreal",
                    tag:"Unity's Tanks! sample rewritten in Unreal C++",
                    ref:"https://github.com/ravbug/TanksUnreal",
                    img:"img/unrealengine.svg"
                },
                {
                    title:"Minecraft Sounds Extractor",
                    img:"img/mcextractor.png",
                    tag:"Extract the audio files from Minecraft Java Edition",
                    ref:"https://github.com/Ravbug/MCSoundsExtractorCPP",
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
            title:"Web Development",
            content:[     
                {
                    title: "WebPhoto",
                    img: "webphoto/icon.svg",
                    tag: "A non-destructive image editor using CSS and SVG filters (beta)",
                    ref: "webphoto/"
                },
                {
                    title:"Rate My Professors Scraper",
                    img:"img/rmp.png",
                    tag:"Quickly get a list of the best professors for your classes",
                    ref:"rate-my-professors-scraper/",
                },
                {
                    title:"AutoResponder",
                    img:"https://images-ext-1.discordapp.net/external/SwQny5232U0cU3rqx9OZcLLucdkjppRcxocu7Dpu1p4/%3Fsize%3D256/https/cdn.discordapp.com/avatars/409947148172394498/7ff43b27f39a267fc9f658cbdf99775f.png",
                    tag:"A customizable, regex-powered responder bot for your Discord server",
                    ref:"https://autoresponder.glitch.me",
                },
                {
                    title:"Cleverbug",
                    img:"https://images-ext-1.discordapp.net/external/FZ6XbC9DP_MCNKIog6TaBwbnO0qIW7mCAd7KGrUGkPs/%3Fsize%3D256/https/cdn.discordapp.com/avatars/374793801455108097/34cd9178a4f93f3dfb14fa55a0f3f74f.png",
                    tag:"A fun chatbot for your Discord server",
                    ref:"https://cleverbug.glitch.me"
                },
                {
                    title:"Legacy Web Cleverbug",
                    img:"cleverbug-alpha/cleverbot.png",
                    tag:"The webpage-based ancestor to the Cleverbug Discord bot. Source available!",
                    ref:"cleverbug-alpha/"
                },
                {
                    title:"PoetryBot",
                    tag:"A Discord bot which writes original poems using text from webpages",
                    ref:"https://poetrybot.glitch.me",
                    img:"https://images-ext-1.discordapp.net/external/IQgrzgr3aTx3n93OQ4v4zgpIom92b8VDMcnox5VrcBg/%3Fsize%3D256/https/cdn.discordapp.com/avatars/592779132233056277/b1f8cbff5010de682266ed3073b69b4a.png"
                },
                {
                    title:"QReaper",
                    tag:"A Discord bot which deletes QR Codes it sees",
                    ref:"https://qreaper.glitch.me",
                    img:"https://cdn.discordapp.com/avatars/666309507105816586/9e1e20e18619535cbf4f87f454957d5b.png?size=2048"
                },
                {
                    title:"CodeVisualizer",
                    tag:"A live-updating webpage editor in your browser!",
                    ref:"codevisualizer/",
                    img:"img/code.svg"
                },
                {
                    title:"Ravbug's Funetik Alphabet",
                    img:"img/dictionary.svg",
                    tag:"What if English spelling was phonetic?",
                    ref:"rfa/"
                },
                {
                    title:"YouTube Audio Player",
                    img: "yt-audio/yt.svg",
                    tag: "An audio-only player for YouTube videos and playlists. Does not (intentionally) reduce data usage.",
                    ref:"yt-audio/"
                },
                {
                    title:"Calculator",
                    tag:"A fast scientific calculator in your browser",
                    ref:"calculator/",
                    img:"calculator/icon.svg"
                },
                {
                    title:"Article Summarizer",
                    tag:"A clientside text summarizer, using WebWorkers",
                    ref:"summarizer/",
                    img:"img/t_pen.svg"
                },
                {
                    title:"Editable BSODs",
                    tag:"An editable Windows blue screen of death, using content-editable divs",
                    ref:"bsod/",
                    img:"img/windows.svg"
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
                {
                    title:"JConsole",
                    tag:"An interactive JavaScript playground",
                    ref:"jconsole/",
                    img:"img/t_pager.svg"
                },
                {
                    title:"Motion Remover",
                    tag:"Generate a clean still image from a video by removing the moving objects",
                    ref:"motionremover/",
                    img:"img/t_camera_flash.svg"
                },
                {
                    title:"Random Number Generator",
                    tag:"Generate random numbers in a range and guarantee no repeats",
                    ref:"rng/",
                    img:"img/t_dice.svg"
                },
                {
                    title:"Text Transformer",
                    tag:"Fun typo generator",
                    ref:"texttransformer/",
                    img:"img/t_abc.svg"
                },
                {
                    title:"YouTube Thumbnail Downloader",
                    tag:"Download the full-size thumbnail for a YouTube video",
                    ref:"thumbnaildownloader/",
                    img:"img/youtube.svg"
                },
                {
                    title:"Discord Block Letters",
                    tag:"Convert text to :regional_indicator: emojis to yell extra loudly in Discord",
                    ref:"discordblockletters/",
                    img:"img/t_regional_s.svg"
                },
                {
                    title:"Full Window YouTube",
                    tag:"Scale a YouTube video to fill the whole browser window",
                    ref:"fullwindowvideo/",
                    img:"img/fullscreen.svg"
                },
                {
                    title:"Factorizer",
                    tag:"Find factors and common factors of numbers",
                    ref:"factors/",
                    img:"img/t_obelus.svg"
                },
            ]
        },
        {
            title:"Animation and Rigging",
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
                {
                    title:"Minecraft Animal Rigs",
                    img:"img/mcsheep.png",
                    tag:"Sheep, wolves, cats, rabbits, etc",
                    ref:"rigs/minecraft-animal",
                }
            ]
        },
        {
            title:"Tutorials",
            content:[
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
                    tag:"Set up Maya render layers and Nuke nodes",
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
                    title:"Kit Spleef",
                    img: "img/kitspleef.png",
                    tag: "The classic minecraft minigame with a chaotic spin! No player cap.",
                    ref: "https://www.curseforge.com/minecraft/worlds/kit-spleef",
                },
                {
                    title: "Minecraft Google Translate Resource Pack",
                    img: "img/googletranslate.svg",
                    tag: "Google Translating all of the game's text too many times",
                    ref: "mc-googletranslate/"
                },
                {
                    title:"Math experiments",
                    img:"img/desmos.png",
                    tag:"Various fun thought experiments I've conducted with math",
                    ref:"math/",
                },
                {
                    title:"Mastermind Python",
                    img:"img/pygame.png",
                    tag:"The Mastermind game, written in python and pygame",
                    ref:"https://github.com/ravbug/mastermind"
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