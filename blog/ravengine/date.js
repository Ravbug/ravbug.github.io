{
    let dateobj = new Date(Date.parse(document.currentScript.getAttribute("date")));
    document.currentScript.outerHTML =`Last Updated: ${dateobj.toLocaleDateString()}<br><p style="color:red">Note: I write these articles as I learn. As such, information present here may be incorrect or out-of-date.</p>`;
}