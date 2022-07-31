// only load google ads if the the page is not launched locally
if (window.location.protocol != "file:")
{
    let script = document.createElement('script')
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5775858651010213"
    script.async = true
    script.crossOrigin = "anonymous"
    document.getElementsByTagName('head')[0].appendChild(script)
}
document.currentScript.remove()
