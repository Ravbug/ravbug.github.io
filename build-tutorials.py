common_card = """
<div class="card">
    <p>
        <a href="{resolvedRef}"><img class="card-img" src="{resolvedImg}"></a>
        <a class=attention href="{resolvedRef}">{card_title}</a>
        <br>
        {card_tag}   
    </p>
</div>
"""


import json


homepage_data = ""
with open("homepage.json", "r") as infile:
    homepage_data = infile.read()

homepage_data = json.loads(homepage_data)

components = []
for card in homepage_data["tutorials"]["content"]:
    if "enabled" in card and card["enabled"] == False:
            continue

    ref = card['ref']
    if not ref.startswith("http"):
        ref = f"../{ref}"

    img = card['img']
    if not img.startswith("http"):
        img = f"../{img}"
    newcard = common_card.replace("{resolvedRef}",ref)
    newcard = newcard.replace("{resolvedImg}",img)
    newcard = newcard.replace("{card_title}",f"{card['title']}")
    newcard = newcard.replace("{card_tag}",f"{card['tag']}")
    components.append(newcard)

filedata = ""
with open("tutorials/index.html", "r") as infile:
    filedata = infile.read()

filedata = filedata.replace("{TUTORIAL_CONTENT}", "".join(components))

with open("tutorials/index.html", "w") as outfile:
    outfile.write(filedata)