let dateobj = new Date(Date.parse(document.currentScript.getAttribute("date")));
document.currentScript.outerHTML = `${dateobj.toLocaleDateString()}`