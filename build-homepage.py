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

content = []
headers = []

for section_title, section_data in homepage_data.items():
    components = []
    jump = section_data["title"].lower().replace(" ", "_")
    if not ("no_toolbar" in section_data and section_data.get("no_toolbar")):
        headers.append(f"<a href='#{jump}'>{section_data.get('title')}</a>")

    for card in section_data["content"]:
        if "enabled" in card and card["enabled"] == False:
            continue

        ref = card['ref']
        if not ref.startswith("http"):
            ref = f"./{ref}"

        img = card['img']
        if not img.startswith("http"):
            img = f"./{img}"
        newcard = common_card.replace("{resolvedRef}",ref)
        newcard = newcard.replace("{resolvedImg}",img)
        newcard = newcard.replace("{card_title}",f"{card['title']}")
        newcard = newcard.replace("{card_tag}",f"{card['tag']}")
        components.append(newcard)

    cardsection = f"""
    <h2 id="{jump}">{section_data["title"]} <a href="#{jump}">🔗</a></h2>{section_data.get("description", "")}
    <article id='article'>{"".join(components)}</article>
    """
    content.append(cardsection)

filedata = ""
with open("index.html", "r") as infile:
    filedata = infile.read()

filedata = filedata.replace("{HOMEPAGE_TOOLBAR}", " | ".join(headers))
filedata = filedata.replace("{HOMEPAGE_CONTENT}", "<br>".join(content))

with open("index.html", "w") as outfile:
    outfile.write(filedata)