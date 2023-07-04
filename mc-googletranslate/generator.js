const patch_start_version = 16;
const currentVersion = 20;
const numVariants = [5,4,3,2]
const variantVersions = [14,16,17,18]

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
const configurator = document.getElementById('configurator')
const levelButtons = []

function genUI(){

  for(let version = patch_start_version; version <= currentVersion + 1; version++){
    const i = version - patch_start_version;
    const group = document.createElement('fieldset')
    const vver = variantVersions[i] == undefined ? version-1 : variantVersions[i];
    group.innerHTML = `<legend>1.${vver} patch variant</legend>`
    const variantCount = i < numVariants.length ? numVariants[i] : 1;
    const buttonArr = []
    for(let index = 0; index < variantCount; index++){
      const divider = document.createElement('p')
      const button = document.createElement('input');
      button.type = "radio"
      button.id = `e${index}`
      button.value = index+1
      button.name = `sel-${vver}`
      if (index == 0){
        button.checked = true
      }
      const label = document.createElement('label')
      label.for = button.name
      label.innerHTML = `Variant ${index+1}`

      buttonArr.push(button)

      divider.appendChild(button)
      divider.appendChild(label)
      group.appendChild(divider)
    }
    levelButtons.push(buttonArr)
    configurator.appendChild(group)
  }
}
genUI()

async function generatePack(sender){
    sender.disabled = true;
    setTimeout(() => {sender.disabled = false},5000)

    const level = levelSelect.options[levelSelect.selectedIndex].text
    let baseEdition = 1;
    for(const button of levelButtons[0]){
      if (button.checked){
        baseEdition = button.value
      }
    }

    // determine which game editions are selected
    let gameVersionEditions = [];
    for(const buttonArr of levelButtons.slice(1)){
      for(const button of buttonArr){
        if (button.checked){
          gameVersionEditions.push(button.value)
        }
      }
    }
    
    // get the base data
    let full_game_data = await (await fetch(`generator/base_game_${level}_${baseEdition}.json`)).json()
    let full_realms_data = await (await fetch(`generator/base_realms_${level}.json`)).json()
    //let full_credits_data = await (await fetch(`generator/base_credits_${level}.json`)).json()

    // get the patches
    for(let i = patch_start_version; i <= currentVersion; i++){
        const editionIndex = i - patch_start_version;
        let gameEdition = editionIndex < gameVersionEditions.length ? gameVersionEditions[editionIndex] : 1;
        const game_data = await (await fetch(`generator/${i}_game_${level}_${gameEdition}.json`)).json()
        const realms_data = await (await fetch(`generator/${i}_realms_${level}.json`)).json()
        full_game_data = {...full_game_data, ...game_data};
        full_realms_data = {...full_realms_data, ...realms_data};
        if (i >= 19){
          //const credits_data = await (await fetch(`generator/${i}_credits_${level}.json`)).json()
          //full_credits_data = {...full_credits_data, ...credits_data}
        }
    }

    const splashes = await (await fetch(`generator/${currentVersion}_splashes_${level}.txt`)).text()
    const end = await (await fetch(`generator/${currentVersion}_end_${level}.txt`)).text()
    const postcredits = await (await fetch(`generator/${currentVersion}_postcredits_${level}.txt`)).text()

    const thumbnail = await( await fetch(`generator/icon_${level}.png`)).blob()

    const zip = new JSZip();

    zip.file("pack.mcmeta",`{
        "pack": {
           "pack_format": 15,
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

    zip.file("pack.png",thumbnail,{binary:true})

    
    // main game strings
    zip.file("assets/minecraft/lang/google_translate.json",JSON.stringify(full_game_data))
    // realms strings
    zip.file("assets/realms/lang/google_translate.json",JSON.stringify(full_realms_data))
    // (1.19+) new credits format
    //zip.file("assets/minecraft/texts/credits.json",JSON.stringify(full_credits_data))

    // extra strings
    zip.file("assets/minecraft/texts/splashes.txt",splashes)
    zip.file("assets/minecraft/texts/end.txt",end)
    zip.file("assets/minecraft/texts/postcredits.txt",postcredits)

    zip.generateAsync({type:"blob"}).then((content) => {
        downloadBlob(content, `Google Translate ${level} 1.${currentVersion} (Ravbug).zip`);
    })
}