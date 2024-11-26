{
    let dateobj = new Date(Date.parse(document.currentScript.getAttribute("date")));
    document.currentScript.outerHTML =`Last Updated: ${dateobj.toLocaleDateString()}<br><p style="color:red">Note: This is NOT engine documentation. I write these articles as I learn. As such, information present here may be incorrect or out-of-date. I'm leaving these pages online for historical purposes only.</p>`;
}
