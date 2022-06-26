function makecard(card,root="."){
    let resolvedRef = card.ref;
    if (!card.ref.startsWith("http")){
        // update paths
        resolvedRef = `${root}/${resolvedRef}`
    }

    let resolvedImg = card.img;
    if (!card.img.startsWith("http")){
        //
        resolvedImg = `${root}/${resolvedImg}`
    }

    return `<div class="card">
                <p>
                    <a href="${resolvedRef}"><img class="card-img" src="${resolvedImg}"></a>
                    <a class=attention href="${resolvedRef}">${card.title}</a>
                    <br>
                    ${card.tag}   
                </p>
            </div>
            `
}