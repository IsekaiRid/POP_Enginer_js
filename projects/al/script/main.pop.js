let naila_normal = "../assets/naila_normal.png";
let naila_sedih = "../assets/naila_sedih.png";
let naila_senang = "../assets/naila_senang.png";
let restu_normal = "../assets/restu_normal.png";
let restu_sad = "../assets/restu_sedih.png";
let rara_sedih = "../assets/rara_sedih.png";
let toni_normal = "../assets/toni_normal.png";
let toni_senang = "../assets/toni_senang.png";
let room  = "../assets/sc.jpg";
let toko_buku  = "../assets/tokobuku.jpg";

label start:
    play music '../audio/music.mp3'
    show room

    show restu_normal at left
    restu_normal: "Pagi ini kelas terasa biasa saja."
    restu_normal: "Aku datang sedikit lebih awal dan duduk di bangku kiri dekat jendela."

    show naila_normal at right
    naila_normal: "Kamu kelihatan santai."

    restu_normal: "Karena belum banyak yang terjadi."

    naila_normal: "Nikmati saja sebelum kelas ramai."

    jump suasana_kelas


label suasana_kelas:
    show room

    restu_normal: "Satu per satu murid mulai berdatangan."
    restu_normal: "Suara obrolan pelan memenuhi ruangan."

    naila_normal: "Pelajaran pertama apa hari ini?"

    restu_normal: "Sejarah."
    restu_normal: "Pelajaran yang bikin waktu terasa lambat."

    naila_normal: "Setidaknya gurunya tidak galak."

    restu_normal: "Itu nilai plus."

    jump istirahat


label istirahat:
    show room

    restu_normal: "Bel istirahat akhirnya berbunyi."
    restu_normal: "Beberapa murid langsung keluar kelas."

    show toni_normal at right
    toni_normal: "Kalian ke kantin?"

    restu_normal: "Belum."
    restu_normal: "Masih malas berdiri."

    show rara_sedih at right
    rara_sedih: "Aku bawa bekal."

    show naila_normal at right
    naila_normal: "Keputusan cerdas."

    restu_normal: "Aku salah perhitungan hari ini."

    jump ngobrol_ringan


label ngobrol_ringan:
    show room

    toni_normal: "Sepulang sekolah kalian mau ke mana?"

    menu:
        "Langsung pulang":
        restu_normal: "Aku rencana langsung pulang."

        naila_normal: "Oh, begitu."

        toni_normal: "Hari ini capek?"

        restu_normal: "Sedikit."
        restu_normal: "Pengen istirahat."

        jump pulang_cepat

        "Pergi ke toko buku":
        restu_normal: "Aku kepikiran mau ke toko buku."

        show naila_senang at right
        naila_senang: "Serius?"
        naila_senang: "Aku ikut!"

        toni_normal: "Ya sudah."
        rara_sedih: "Aku ikut sebentar."

        jump ke_toko_buku


label pulang_cepat:
    show room

    restu_normal: "Pelajaran terakhir selesai tanpa kejutan."
    restu_normal: "Aku langsung beres-beres."

    naila_normal: "Kalau begitu, sampai besok."

    restu_normal: "Iya."
    restu_normal: "Hati-hati di jalan."

    restu_normal: "Hari ini terasa singkat."
    restu_normal: "Tapi cukup menenangkan."

    jump ending_pulang


label ending_pulang:
    show room

    restu_normal: "Sore hari kulewati dengan santai di rumah."
    restu_normal: "Tanpa rencana tambahan."

    restu_normal: "Kadang pulang lebih awal bukan pilihan buruk."

    "TAMAT": "Terima kasih sudah memainkan test game ini."


label ke_toko_buku:
    show toko_buku

    show restu_normal at left
    restu_normal: "Kami akhirnya sampai di toko buku."
    restu_normal: "Suasananya lebih tenang dibanding sekolah."

    show naila_senang at right
    naila_senang: "Aku sudah lama mau ke sini."

    toni_normal: "Aku cuma sebentar."

    rara_sedih: "Aku ke bagian alat tulis."

    jump ngobrol_toko


label ngobrol_toko:
    show toko_buku

    menu:
        "Menemani Naila memilih buku":
        restu_normal: "Aku temani kamu."

        naila_senang: "Makasih."
        naila_senang: "Pendapat kamu biasanya cocok."

        restu_normal: "Tekanan besar itu."

        jump ending_buku

        "Melihat-lihat sendiri":
        restu_normal: "Aku mau keliling dulu."

        naila_normal: "Oke."
        naila_normal: "Nanti ketemu lagi."

        jump ending_sendiri


label ending_buku:
    show toko_buku

    restu_normal: "Waktu terasa cepat berlalu di antara rak buku."

    naila_senang: "Hari ini menyenangkan."

    restu_normal: "Iya."
    restu_normal: "Pilihan yang tepat."

    "TAMAT": "Terima kasih sudah memainkan test game ini."


label ending_sendiri:
    show toko_buku

    restu_normal: "Aku berkeliling tanpa tujuan."
    restu_normal: "Menikmati suasana dengan caraku sendiri."

    restu_normal: "Tidak buruk juga."

    "TAMAT": "Terima kasih sudah memainkan test game ini."
