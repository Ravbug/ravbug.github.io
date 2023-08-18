// use ~ to indicate home directory
// start paths with / to indicate root directory
// only include shame paths

const allPrograms = {
   "DotNET" : {
        "vendor": "Microsoft",
        "paths":{
            "win":[
                "~/.dotnet"
            ],
            "mac": [
                "~/.dotnet"
            ],
        }
    },
    "Visual Studio Code" : {
        "vendor": "Microsoft",
        "paths":{
            "win":[
                "~/.vscode",
                "~/.vscode-react-native"
            ],
            "mac": [
                "~/.dotnet",
                "~/.vscode-react-native",
                "~/.local/share/"
            ],
        }
    },
    "Swift PM" : {
        "vendor": "Apple",
        "paths" : {
            "linux":[
                "~/.swiftpm",
            ],
            "mac": [
                "~/.swiftpm",
            ],
        }
    },
    "Maya" : {
        "vendor": "Autodesk",
        "paths": {
            "win":[
                "~/Documents/maya",
                "/Autodesk/*",
               "/solidangle/"
            ],
            "mac" : [
                "~/Documents/maya"
            ]
        }
    },
    "Unity" : {
        "vendor": "",
        "paths": {
            "win":[

            ],
            "mac" : [
                "~/.plastic4",
                "~/.mono"
            ]
        }
    },
    "git" : {
        "vendor" : "",
        "paths": {
            "win" : [
               "~/.gitconfig"
            ],
            "mac" : [
                "~/.git"
            ],
            "linux" : [
                "~/.git"
            ]
        }
    },
    "CMake" : {
        "vendor" : "",
        "paths" : {
            "win" : [],
            "mac" : [
                "~/.cmake"
            ],
            "linux" : [
                "~/.cmake"
            ]
        }

    },
    "NodeJS" : {
        "vendor" : "",
        "paths" : {
            "win" : [],
            "mac" : [
                "~/.node",
                "~/.npm"
            ],
            "linux" : [
                "~/.node",
                "~/.npm"
            ]
        }
    },
    "Visual Studio (Mac)": {
        vendor: "Microsoft",
        paths: {
            mac: [
                "~/.templateEngine",
                "~/.nuget"
            ]
        }
    },
   "Visual Studio": {
        vendor: "Microsoft",
        paths: {
            win: [
                "~/.templateEngine",
                "~/.nuget",
               "~/Documents/Visual Studio 20XX"
            ]
        }
    },
    "Star Wars Battlefront II": {
        vendor: "Electronic Arts",
        paths: {
            win: [
                "~/Documents/STAR WARS Battlefront II",
            ]
        }
    },
    "SteamVR": {
        vendor: "Valve",
        paths: {
            win: [
                "~/Documents/steamvr",
            ],
           linux: []
        }
    },
   "Quartus": {
        vendor: "Intel",
        paths: {
            win: [
                "~/Documents/steamvr",
               "~/quartus2.ini"
               "~/quartus2.qreg"
               "/intelFPGA_lite"
            ],
           linux: []
        }
    },
}
