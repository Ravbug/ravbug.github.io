/*
A very simple analytics system that uses bitly links.

To use, include this file like this:
<script src="statistics.js" url="https://bitly.com/xxxxxx"></script>

On load, the script will hit that url. To minimize overhead, point the bitly url at a blank file on your domain.
*/

//do not load if local file
{
    async function load(sourcescript){
        if(window.location.protocol != "file:"){
            //load url
           await fetch(document.currentScript.getAttribute('url'));
        }
        sourcescript.remove();
    }
    load(document.currentScript);
}