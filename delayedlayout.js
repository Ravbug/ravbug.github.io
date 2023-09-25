{
    const layoutstr = 
    `<div class="paddingGrid">
    <paddingGridElt>
        <displayAd class="tallThinAd"></displayAd>
        <displayAd class="tallThinAd"></displayAd>
    </paddingGridElt>
    <div class="paddingGridVertical">

        <div id="content_parent">

        </div>
        
        <displayAd class="longWideAd"></displayAd>
        <displayAd class="longWideAd"></displayAd>
    </div>
    <paddingGridElt>
        <displayAd class="tallThinAd"></displayAd>
        <displayAd class="tallThinAd"></displayAd>
    </paddingGridElt>
    </div>
    `
    const containerElt = document.createElement('div')
    containerElt.innerHTML = layoutstr;
    const newParent = containerElt.querySelector("#content_parent")

    const targetelt =  document.getElementById(document.currentScript.getAttribute('target'))

    // place it next to the target element
    targetelt.parentElement.append(containerElt)
    
    // move the target inside the layout
    newParent.appendChild(targetelt);

    document.currentScript.remove();
}