document.currentScript.outerHTML = `
<div class="alert alert-danger">
<h2>This is a discontinued project.</h2> It is kept online in its current state but may no longer be functional.<br>
${document.currentScript.getAttribute('reason') ? `Reason for discontinuation: ${document.currentScript.getAttribute('reason')}` : ""}
</div>
`
document.currentScript.remove()