import os
from PIL import Image, ImageDraw, ImageFont

CARD_SPECS = [
    # Energies
    {"id": "sve-1", "name": "Basic Grass Energy", "type": "Grass", "kind": "Energy", "energy_symbol": "🌿", "bg": (22, 101, 52), "accent": (34, 197, 94)},
    {"id": "sve-4", "name": "Basic Lightning Energy", "type": "Lightning", "kind": "Energy", "energy_symbol": "⚡", "bg": (161, 98, 7), "accent": (234, 179, 8)},
    {"id": "sve-8", "name": "Basic Metal Energy", "type": "Metal", "kind": "Energy", "energy_symbol": "⚙️", "bg": (71, 85, 105), "accent": (148, 163, 184)},
    
    # Raging Bolt & Ogerpon
    {"id": "sv5-123", "name": "Raging Bolt ex", "type": "Dragon", "stage": "Basic", "hp": "240", "attacks": [("Bursting Roar", "Discard hand & draw 6"), ("Bellowing Thunder", "70x basic Energy discard")], "bg": (180, 140, 20), "accent": (234, 179, 8)},
    {"id": "sv6-25", "name": "Teal Mask Ogerpon ex", "type": "Grass", "stage": "Basic", "hp": "210", "ability": "Teal Dance: Attach Grass & draw 1", "attacks": [("Myriad Leaf Shower", "30+ per Energy")], "bg": (22, 101, 52), "accent": (74, 222, 128)},
    
    # Gardevoir Line
    {"id": "sv1-84", "name": "Ralts", "type": "Psychic", "stage": "Basic", "hp": "70", "attacks": [("Dissonance", "10")], "bg": (126, 34, 206), "accent": (216, 180, 254)},
    {"id": "sv1-85", "name": "Kirlia", "type": "Psychic", "stage": "Stage 1", "hp": "90", "ability": "Refinement: Discard 1, draw 2", "attacks": [("Smack", "30")], "bg": (126, 34, 206), "accent": (216, 180, 254)},
    {"id": "sv1-86", "name": "Gardevoir ex", "type": "Psychic", "stage": "Stage 2", "hp": "310", "ability": "Psychic Embrace: Attach from discard", "attacks": [("Miracle Force", "190")], "bg": (88, 28, 135), "accent": (192, 132, 252)},
    {"id": "sv4pt5-77", "name": "Scream Tail", "type": "Psychic", "stage": "Basic", "hp": "90", "attacks": [("Roaring Scream", "20x damage counters")], "bg": (147, 51, 234), "accent": (244, 114, 182)},
    {"id": "sv1-89", "name": "Drifloon", "type": "Psychic", "stage": "Basic", "hp": "70", "attacks": [("Balloon Bombs", "30x damage counters")], "bg": (109, 40, 217), "accent": (167, 139, 250)},
    
    # Miraidon Line
    {"id": "sv1-81", "name": "Miraidon ex", "type": "Lightning", "stage": "Basic", "hp": "220", "ability": "Tandem Unit: Search 2 Lightning", "attacks": [("Photon Blaster", "220")], "bg": (161, 98, 7), "accent": (250, 204, 21)},
    {"id": "sv4-70", "name": "Iron Hands ex", "type": "Lightning", "stage": "Basic", "hp": "230", "attacks": [("Arm Press", "160"), ("Amp You Very Much", "120 (+1 Prize)")], "bg": (146, 64, 14), "accent": (251, 191, 36)},
    {"id": "sv1-78", "name": "Raikou", "type": "Lightning", "stage": "Basic", "hp": "120", "attacks": [("Lightning Ball", "90")], "bg": (180, 83, 9), "accent": (253, 224, 71)},
    {"id": "sv1-79", "name": "Zapdos", "type": "Lightning", "stage": "Basic", "hp": "120", "attacks": [("Thunderbolt", "130")], "bg": (180, 83, 9), "accent": (253, 224, 71)},
    
    # Gholdengo Line
    {"id": "sv4-198", "name": "Gimmighoul", "type": "Metal", "stage": "Basic", "hp": "70", "attacks": [("Minor Errand-Running", "Search 2 Energy")], "bg": (100, 116, 139), "accent": (203, 213, 225)},
    {"id": "sv4-139", "name": "Gholdengo ex", "type": "Metal", "stage": "Stage 1", "hp": "260", "ability": "Coin Bonus: Draw 1 (2 in Active)", "attacks": [("Make It Rain", "50x per Energy discarded")], "bg": (161, 120, 20), "accent": (250, 204, 21)},
    
    # Zoroark Line
    {"id": "sv10-141", "name": "Zorua", "type": "Darkness", "stage": "Basic", "hp": "70", "attacks": [("Stampede", "20")], "bg": (30, 41, 59), "accent": (148, 163, 184)},
    {"id": "sv10-142", "name": "N's Zoroark ex", "type": "Darkness", "stage": "Stage 1", "hp": "280", "ability": "Trade: Discard 1, draw 2", "attacks": [("Doom Crush", "180 (Discard energy)")], "bg": (15, 23, 42), "accent": (225, 29, 72)},
    
    # Grimmsnarl Line
    {"id": "sv10-128", "name": "Impidimp", "type": "Darkness", "stage": "Basic", "hp": "70", "attacks": [("Scratch", "20")], "bg": (30, 41, 59), "accent": (168, 85, 247)},
    {"id": "sv10-129", "name": "Morgrem", "type": "Darkness", "stage": "Stage 1", "hp": "90", "attacks": [("Bite", "50")], "bg": (24, 24, 27), "accent": (192, 132, 252)},
    {"id": "sv10-130", "name": "Marnie's Grimmsnarl ex", "type": "Darkness", "stage": "Stage 2", "hp": "310", "attacks": [("Tormenting Horn", "170 (Can't attack)"), ("Shadow Impact", "220")], "bg": (9, 9, 11), "accent": (236, 72, 153)},
    
    # Exeggutor Line
    {"id": "sv8-1", "name": "Exeggcute", "type": "Grass", "stage": "Basic", "hp": "30", "attacks": [("Precocious Evolution", "Search deck for evolution")], "bg": (20, 83, 45), "accent": (74, 222, 128)},
    {"id": "sv8-3", "name": "Exeggutor", "type": "Grass", "stage": "Stage 1", "hp": "130", "attacks": [("Barrage O'Clock", "60x flip coin per Energy on Actives")], "bg": (20, 83, 45), "accent": (74, 222, 128)},
    {"id": "sv8-133", "name": "Alolan Exeggutor ex", "type": "Grass", "stage": "Stage 1", "hp": "300", "attacks": [("Tropical Frenzy", "150 (Attach Energy from hand)"), ("Swinging Sphene", "KO opponent's Pokemon")], "bg": (15, 65, 35), "accent": (250, 204, 21)},
    {"id": "30c-2", "name": "Alolan Exeggutor", "type": "Grass", "stage": "Stage 1", "hp": "150", "ability": "Scale Up: +250 HP if >=6 Grass Energy", "attacks": [("Mega Drain", "150 (Heal 50)")], "bg": (20, 83, 45), "accent": (74, 222, 128)},
    {"id": "sv8pt5-4", "name": "Budew", "type": "Grass", "stage": "Basic", "hp": "30", "attacks": [("Itchy Pollen", "10 (Opponent can't play Items)")], "bg": (22, 101, 52), "accent": (134, 239, 172)},
    {"id": "sv5-152", "name": "Hero's Cape", "type": "Colorless", "kind": "Tool", "stage": "ACE SPEC", "hp": "+100", "ability": "Tool: Pokémon gets +100 HP", "bg": (153, 27, 27), "accent": (248, 113, 113)},

    # Meganium Evolution Line & Stadium (Mega Evolution - Mark I)
    {"id": "me1-8", "name": "Chikorita", "type": "Grass", "stage": "Basic", "hp": "70", "attacks": [("Razor Leaf", "20")], "bg": (22, 101, 52), "accent": (134, 239, 172), "regulation": "I"},
    {"id": "me1-9", "name": "Bayleef", "type": "Grass", "stage": "Stage 1", "hp": "110", "attacks": [("Push Down", "50 (Switch opponent active)")], "bg": (20, 83, 45), "accent": (74, 222, 128), "regulation": "I"},
    {"id": "me1-10", "name": "Meganium", "type": "Grass", "stage": "Stage 2", "hp": "160", "ability": "Wild Growth: Basic Grass Energy = 2 Grass", "attacks": [("Solar Beam", "140")], "bg": (15, 65, 35), "accent": (34, 197, 94), "regulation": "I"},
    {"id": "me1-117", "name": "Forest of Vitality", "type": "Grass", "stage": "Stadium", "ability": "Hutan Vitalis: Grass Pokémon can evolve immediately", "attacks": [("Instant Evolution", "Evolusi Pokemon Daun di giliran dimainkan")], "bg": (20, 83, 45), "accent": (74, 222, 128), "regulation": "I"},

    # Energy Switch & Bug Catching Set
    {"id": "me1-115", "name": "Energy Switch", "type": "Colorless", "stage": "Item", "ability": "Pindahkan Basic Energy antar Pokémon sendiri", "attacks": [("Move Energy", "Pindahkan 1 Energy ke Pokemon lain")], "bg": (30, 41, 59), "accent": (56, 189, 248), "regulation": "I"},
    {"id": "sv6-143", "name": "Bug Catching Set", "type": "Grass", "stage": "Item", "ability": "Top 7 dek -> ambil hingga 2 Daun/Energi", "attacks": [("Jaring Penangkap", "Ambil 2 kombinasi Pokemon/Energi Daun")], "bg": (20, 83, 45), "accent": (74, 222, 128), "regulation": "H"},

    # Baby Box Cards
    {"id": "30c-120", "name": "Igglybuff", "type": "Colorless", "stage": "Basic", "hp": "30", "attacks": [("Bouncy Circle", "30x for each Benched Pokemon HP <= 30")], "bg": (219, 39, 119), "accent": (244, 114, 182), "regulation": "J"},
    {"id": "pbl-5", "name": "Poltchageist", "type": "Grass", "stage": "Basic", "hp": "30", "attacks": [("Spill Powder", "10")], "bg": (20, 83, 45), "accent": (74, 222, 128), "regulation": "J"},
    {"id": "dri-48", "name": "Misty's Magikarp", "type": "Water", "stage": "Basic", "hp": "30", "ability": "So Submerged: Immune on Bench", "attacks": [("Splash", "10")], "bg": (2, 132, 199), "accent": (56, 189, 248), "regulation": "I"},
    {"id": "meg-71", "name": "Tyrogue", "type": "Fighting", "stage": "Basic", "hp": "30", "attacks": [("Pow-Pow Punching", "10+ (30x heads until tails)")], "bg": (180, 83, 9), "accent": (245, 158, 11), "regulation": "I"},
    {"id": "dri-10", "name": "Shaymin", "type": "Grass", "stage": "Basic", "hp": "80", "ability": "Flower Curtain: Protect non-Rule Box Bench", "attacks": [("Smash Kick", "30")], "bg": (22, 101, 52), "accent": (134, 239, 172), "regulation": "I"},
    {"id": "cri-70", "name": "Patrat", "type": "Colorless", "stage": "Basic", "hp": "70", "ability": "Watchful Eye: Prevent moving damage", "attacks": [("Bite", "10")], "bg": (71, 85, 105), "accent": (148, 163, 184), "regulation": "J"},
    {"id": "tef-144", "name": "Buddy-Buddy Poffin", "type": "Colorless", "stage": "Item", "ability": "Search 2 Basic Pokemon <=70 HP to Bench", "attacks": [("Poffin Search", "Cari 2 Pokemon Basic <=70 HP")], "bg": (180, 83, 9), "accent": (251, 191, 36), "regulation": "H"},
    {"id": "wht-80", "name": "Brave Bangle", "type": "Colorless", "stage": "Tool", "ability": "Non-ex does +30 damage to Pokemon ex", "attacks": [("Bangle Power", "+30 damage to Pokemon ex")], "bg": (194, 65, 12), "accent": (251, 146, 60), "regulation": "I"},
    {"id": "sv1-186", "name": "Pokégear 3.0", "type": "Colorless", "stage": "Item", "ability": "Top 7 deck -> ambil 1 Supporter", "attacks": [("Gear Search", "Ambil 1 Supporter dari 7 kartu")], "bg": (15, 118, 110), "accent": (45, 212, 191), "regulation": "G"},
    {"id": "tef-155", "name": "Morty's Conviction", "type": "Psychic", "stage": "Supporter", "ability": "Discard 1 card -> draw per opponent benched", "attacks": [("Morty Draw", "Ambil kartu sejumlah bench lawan")], "bg": (88, 28, 135), "accent": (192, 132, 252), "regulation": "H"},
    {"id": "twm-151", "name": "Hassel", "type": "Fighting", "stage": "Supporter", "ability": "If KO last turn -> look 8 cards, pick 3", "attacks": [("Hassel Guidance", "Pilih 3 dari 8 kartu teratas")], "bg": (120, 53, 15), "accent": (217, 119, 6), "regulation": "H"},
    {"id": "tef-159", "name": "Rescue Board", "type": "Colorless", "stage": "Tool", "ability": "Retreat -1 (Retreat 0 if HP <= 30)", "attacks": [("Board Retreat", "Retreat gratis jika HP <= 30")], "bg": (2, 132, 199), "accent": (56, 189, 248), "regulation": "H"},
    {"id": "cri-82", "name": "Special Red Card", "type": "Colorless", "stage": "Item", "ability": "Opponent prizes <=3 -> opponent redraws 3", "attacks": [("Disrupt Hand", "Lawan kocok tangan ke dek, ambil 3")], "bg": (185, 28, 28), "accent": (248, 113, 113), "regulation": "J"},
    {"id": "tef-161", "name": "Mist Energy", "type": "Colorless", "kind": "Energy", "energy_symbol": "⚪", "ability": "Provides 1 Colorless, block attack effects", "bg": (100, 116, 139), "accent": (203, 213, 225), "regulation": "H"},
    {"id": "twm-167", "name": "Legacy Energy", "type": "Colorless", "kind": "Energy", "energy_symbol": "🌈", "ability": "ACE SPEC: Provides all types, gives 1 less prize", "bg": (124, 45, 18), "accent": (245, 158, 11), "regulation": "H"}
]

def render_card(spec):
    width, height = 245, 342
    im = Image.new("RGBA", (width, height), (15, 17, 26, 255))
    draw = ImageDraw.Draw(im)
    
    # Card Border
    is_ex = "ex" in spec.get("name", "")
    border_color = (234, 179, 8) if is_ex else (180, 185, 195)
    draw.rounded_rectangle([(3, 3), (width - 4, height - 4)], radius=12, outline=border_color, width=3)
    
    # Inner Background gradient
    bg_color = spec["bg"]
    accent = spec["accent"]
    for y in range(8, height - 8):
        alpha = (y - 8) / (height - 16)
        r = int(bg_color[0] * (1 - alpha * 0.4) + accent[0] * (alpha * 0.4))
        g = int(bg_color[1] * (1 - alpha * 0.4) + accent[1] * (alpha * 0.4))
        b = int(bg_color[2] * (1 - alpha * 0.4) + accent[2] * (alpha * 0.4))
        draw.line([(8, y), (width - 9, y)], fill=(r, g, b, 255))

    # Header Box
    draw.rounded_rectangle([(10, 10), (width - 11, 48)], radius=6, fill=(10, 14, 22, 220), outline=accent, width=1)
    
    # Font fallbacks
    try:
        font_lg = ImageFont.truetype("arial.ttf", 14)
        font_md = ImageFont.truetype("arial.ttf", 11)
        font_sm = ImageFont.truetype("arial.ttf", 9)
        font_bold = ImageFont.truetype("arialbd.ttf", 13)
        font_hp = ImageFont.truetype("arialbd.ttf", 15)
    except:
        font_lg = ImageFont.load_default()
        font_md = font_lg
        font_sm = font_lg
        font_bold = font_lg
        font_hp = font_lg

    name_text = spec["name"]
    draw.text((14, 14), name_text, fill=(255, 255, 255), font=font_bold)
    
    if spec.get("stage"):
        draw.text((14, 32), spec["stage"] + " · " + spec["type"], fill=(200, 210, 225), font=font_sm)

    if spec.get("hp"):
        hp_str = spec["hp"] + " HP"
        draw.text((width - 70, 14), hp_str, fill=(255, 220, 100) if is_ex else (255, 255, 255), font=font_hp)
    
    # Artwork Illustration Frame
    art_top, art_bottom = 54, 185
    draw.rounded_rectangle([(12, art_top), (width - 13, art_bottom)], radius=8, fill=(15, 23, 42, 240), outline=accent, width=2)
    
    # Elemental Art Badge in Center
    sym = spec.get("energy_symbol") or ("⚡" if spec["type"]=="Lightning" else "🔥" if spec["type"]=="Fire" else "🔮" if spec["type"]=="Psychic" else "🌿" if spec["type"]=="Grass" else "⚙️" if spec["type"]=="Metal" else "🐲" if spec["type"]=="Dragon" else "🌑")
    draw.text((width // 2 - 20, art_top + 35), sym, fill=(255, 255, 255), font=ImageFont.truetype("seguiemj.ttf", 36) if os.path.exists("C:/Windows/Fonts/seguiemj.ttf") else font_lg)
    
    art_title = spec["name"].split(" ex")[0]
    draw.text((width // 2 - len(art_title)*3, art_bottom - 26), art_title, fill=accent, font=font_bold)
    
    # Card Body: Ability & Attacks
    content_y = 194
    if spec.get("ability"):
        draw.rounded_rectangle([(12, content_y), (width - 13, content_y + 34)], radius=4, fill=(185, 28, 28, 220) if "Rocket" in spec["name"] else (194, 65, 12, 220), outline=(254, 215, 170), width=1)
        draw.text((16, content_y + 3), "ABILITY", fill=(255, 237, 213), font=font_sm)
        draw.text((16, content_y + 16), spec["ability"], fill=(255, 255, 255), font=font_sm)
        content_y += 40

    attacks = spec.get("attacks", [])
    for atk_name, atk_desc in attacks:
        draw.line([(16, content_y), (width - 17, content_y)], fill=(255, 255, 255, 60))
        content_y += 4
        draw.text((16, content_y), atk_name, fill=(255, 255, 255), font=font_bold)
        draw.text((16, content_y + 16), atk_desc, fill=(226, 232, 240), font=font_sm)
        content_y += 34
        if content_y > height - 40:
            break

    # Footer
    draw.line([(12, height - 28), (width - 13, height - 28)], fill=(255, 255, 255, 80))
    footer_text = f"Standard Legal · Regulation H · {spec['id'].upper()}"
    draw.text((16, height - 20), footer_text, fill=(148, 163, 184), font=font_sm)

    out_path = os.path.join("assets", "cards", f"{spec['id']}.png")
    im.save(out_path, format="PNG")
    print(f"Rendered: {out_path} ({os.path.getsize(out_path)} bytes)")

for spec in CARD_SPECS:
    render_card(spec)

print("All card images successfully generated!")
