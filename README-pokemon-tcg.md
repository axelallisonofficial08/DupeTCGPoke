# Pokémon TCG: Mega Charizard X vs Mega Lucario

Jalankan `npm start`, lalu buka `http://127.0.0.1:4173/`. Di Chrome atau Edge, menu **Install app** dapat memasang webapp. Setelah kunjungan pertama, halaman dan gambar kartu tersedia melalui cache offline.

## Cara bermain

- Seret Pokémon Basic dari tangan ke Bench. Seret kartu evolusi ke Pokémon yang cocok pada giliran berikutnya.
- Seret Energy atau Pokémon Tool ke Pokémon milikmu. Seret Item atau Supporter ke area Trainer, dan Stadium ke area bersama di tengah kedua arena.
- Klik atau ketuk kartu di tangan jika drag and drop tidak nyaman; pilihan target akan muncul. Klik Pokémon di arena untuk memilih Ability, serangan, atau mundur.
- Serangan hanya tersedia bila Energy terpasang memenuhi jumlah dan jenis pada biaya serangan. Mundur memerlukan Energy sesuai biaya mundur dan Pokémon pengganti di Bench.
- Gunakan tombol **Akhiri giliran** untuk memberi giliran pada lawan komputer.
- Tangan CPU terlihat di bawah arena lawan. Klik kartu untuk membaca teksnya, atau lipat bagian tersebut bila ingin lebih banyak ruang.
- Hanya satu Stadium aktif. Kartu di tengah berlaku untuk kedua pemain; Stadium berbeda dari kamu atau CPU menggantikan kartu lama dan mengirimkannya ke discard pemiliknya.

## Dua deck

Kamu memainkan **Mega Charizard X ex**. CPU memainkan **Mega Lucario ex**. Susunan kartu mengikuti [daftar Mega Lucario ex dari artikel strategi resmi Pokémon](https://www.pokemon.com/us/strategy/pokemon-tcg-deck-list-and-strategy-building-a-mega-lucario-ex-deck) dan [deck awal Mega Charizard X ex di Pokémon TCG Live](https://www.pokemon.com/us/features/pokemon-trading-card-game-live-starter-deck-strategies-march-2026). Beberapa kartu menggunakan cetakan ulang yang legal di Standard 2026; nama dan jumlah kartunya tetap mengikuti daftar sumber.

| Mega Lucario ex · 60 kartu | Jumlah |
| --- | ---: |
| Mega Lucario ex, Riolu, Lunatone, Solrock, Hariyama, Makuhita | 3, 3, 2, 2, 2, 2 |
| Lillie's Determination, Boss's Orders, Brock's Scouting, Judge, Black Belt's Training, Gravity Mountain | 4, 2, 2, 2, 1, 1 |
| Fighting Gong, Poké Pad, Premium Power Pro, Ultra Ball, Night Stretcher, Air Balloon, Secret Box, Switch | 4, 4, 4, 4, 2, 1, 1, 1 |
| Basic Fighting Energy, Rocky Fighting Energy | 10, 3 |

| Mega Charizard X ex · 60 kartu | Jumlah |
| --- | ---: |
| Mega Charizard X ex, Mega Charizard Y ex, Charmeleon, Charmander, Oricorio ex, Reshiram, Fezandipiti ex, Meowth ex | 3, 1, 2, 4, 2, 1, 1, 1 |
| Lillie's Determination, Boss's Orders, Firebreather, Team Rocket's Petrel, Dawn, Judge, Lana's Aid, Battle Cage | 4, 2, 2, 2, 1, 1, 1, 2 |
| Rare Candy, Ultra Ball, Energy Retrieval, Night Stretcher, Poké Pad, Energy Recycler, Mega Signal, Precious Trolley, Air Balloon | 4, 4, 2, 2, 2, 1, 1, 1, 2 |
| Basic Fire Energy | 11 |

Semua kartu non-Energy yang dipakai bertanda **H, I, atau J**. Basic Energy tidak mempunyai tanda regulasi. Data dan gambar kartu disimpan lokal; `download-assets.ps1` dapat mengunduh ulang berkas tersebut.

## Aturan yang tersedia

Setiap pemain memakai 60 kartu, 6 Prize, Active, dan maksimal 5 Pokémon di Bench. Satu Energy dapat dipasang tiap giliran. Mega Pokémon ex memberi **3 Prize** saat Knock Out. Biaya Energy, evolusi, batas Supporter, efek inti Aura Jab, Mega Brave, Inferno X, Rare Candy, Excited Turbo, dan Trainer dalam kedua deck dijalankan. CPU memainkan gilirannya otomatis setelah kamu menyerang atau mengakhiri giliran.

## CPU Pro · tingkat sulit

CPU menyiapkan Riolu, Solrock, dan Lunatone, mencari evolusi Mega Lucario ex, lalu memakai Lunar Cycle dan Aura Jab untuk mempercepat Fighting Energy. CPU mempertimbangkan Mega Brave, Premium Power Pro, Black Belt, Boss's Orders, pergantian Active, serta Gravity Mountain sesuai keadaan arena.

## Batas prototipe

Ini prototipe dengan dua daftar deck tetap dan CPU berbasis strategi, bukan lawan setara pemain turnamen atau mesin Pokémon TCG Live. Pemilihan Active awal, beberapa pilihan pencarian kartu dan pengurutan Energy yang dibuang untuk mundur dilakukan otomatis. Sebagian interaksi efek khusus dan urutan saat beberapa Pokémon KO bersamaan masih disederhanakan. Gambar kartu dan nama Pokémon adalah milik pemegang haknya; gunakan proyek ini untuk pengembangan pribadi.

Sumber: [pengumuman rotasi Standard 2026](https://community.pokemon.com/en-us/discussion/23170/letter-to-the-community-march-19-2026), [aturan Play! Pokémon](https://play.pokemon.com/en-us/resources/rules/), dan [data kartu Pokémon TCG](https://github.com/PokemonTCG/pokemon-tcg-data).

Untuk memeriksa logika inti: `npm test`.

