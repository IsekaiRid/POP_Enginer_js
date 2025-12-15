let naila_sedih = "/assets/naila-sedih.png";
let room        = "/assets/room.png";
let restu       = "/assets/restu.png";
let kinan       = "/assets/kinan.png";

label start:
    restu: "Naila looks sad."
    naila_sedih: "I can't believe this is happening..."
    menu:
        "What should I do?":
        jump ending
        "Talk to Naila":
        show naila_sedih at center
        naila_sedih: "I just need someone to talk to right now."
        "Comfort her":
        show restu at left
        restu: "It's going to be okay Naila."

label ending:
    "???": "nama kamu siapa"
    naila_sedih: "ridwans"