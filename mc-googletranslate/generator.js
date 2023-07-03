const patch_start_version = 16;
const currentVersion = 19;

// source: https://dev.to/nombrekeff/download-file-from-blob-21ho
function downloadBlob(blob, name = 'file.txt') {
    if (
      window.navigator && 
      window.navigator.msSaveOrOpenBlob
    ) return window.navigator.msSaveOrOpenBlob(blob);

    // For other browsers:
    // Create a link pointing to the ObjectURL containing the blob.
    const data = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = data;
    link.download = name;

    // this is necessary as link.click() does not work on the latest firefox
    link.dispatchEvent(
      new MouseEvent('click', { 
        bubbles: true, 
        cancelable: true, 
        view: window 
      })
    );

    setTimeout(() => {
      // For Firefox it is necessary to delay revoking the ObjectURL
      window.URL.revokeObjectURL(data);
      link.remove();
    }, 100);
}


const levelSelect = document.getElementById('level-select')

async function generatePack(){
    const level = levelSelect.options[levelSelect.selectedIndex].text
    
    // get the base data
    let full_game_data = await (await fetch(`generator/base_game_${level}.json`)).json()
    let full_realms_data = await (await fetch(`generator/base_realms_${level}.json`)).json()

    // get the patches
    for(let i = patch_start_version; i < currentVersion; i++){
        const game_data = await (await fetch(`generator/${i}_game_${level}.json`)).json()
        const realms_data = await (await fetch(`generator/${i}_game_${level}.json`)).json()
        full_game_data = {...full_game_data, ...game_data};
        full_realms_data = {...full_realms_data, ...realms_data};
    }

    const splashes = await (await fetch(`generator/${currentVersion}_splashes.txt`)).text()
    const end = await (await fetch(`generator/${currentVersion}_end.txt`)).text()
    const postcredits = await (await fetch(`generator/${currentVersion}_postcredits.txt`)).text()

    const zip = new JSZip();

    zip.file("pack.mcmeta",`{
        "pack": {
           "pack_format": 9,
           "description": "By Ravbug (www.ravbug.com)"
        },
        "language": {
           "google_translate": {
              "name": "Google Translate (${level}) 1.${currentVersion} Additions Only",
              "region": "Translated 10 times, then back to English ",
              "bidirectional": false
           }
        }
    }`)

    
    // main game strings
    zip.file("assets/minecraft/lang/google_translate.json",JSON.stringify(full_game_data))
    // realms strings
    zip.file("assets/realms/lang/google_translate.json",JSON.stringify(full_realms_data))

    // extra strings
    zip.file("assets/minecraft/texts/splashes.txt",splashes)
    zip.file("assets/minecraft/texts/end.txt",end)
    zip.file("assets/minecraft/texts/postcredits.txt",postcredits)

    zip.generateAsync({type:"blob"}).then((content) => {
        downloadBlob(content, `Google Translate ${level} 1.${currentVersion} (Ravbug).zip`);
    })
}