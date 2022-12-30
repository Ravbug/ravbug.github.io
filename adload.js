// only load google ads if the the page is not launched locally
if (window.location.protocol != "file:")
{
    let script = document.createElement('script')
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5775858651010213"
    script.async = true
    script.crossOrigin = "anonymous"
    document.getElementsByTagName('head')[0].appendChild(script)

    const displayAdStr = 
    `
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5775858651010213"
     crossorigin="anonymous"></script>
<!-- DisplayAd -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-5775858651010213"
     data-ad-slot="6301654661"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
    `
    const allDisplayAds = document.querySelectorAll('displayAd')
    for(const adElt of allDisplayAds){
        adElt.innerHTML = displayAdStr
    }
}
document.currentScript.remove()
