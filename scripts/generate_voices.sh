#!/bin/bash
set -e

OUT_DIR="/Users/minihark/src/knattepatrullen/public/audio/voices"
mkdir -p "$OUT_DIR"

gen_sv() {
  local id="$1"
  local text="$2"
  local tmp="/tmp/${id}.aiff"
  local out="${OUT_DIR}/${id}.mp3"
  say -v Alva "$text" -o "$tmp"
  ffmpeg -y -i "$tmp" -ac 1 -ar 24000 -b:a 48k "$out" >/dev/null 2>&1
  rm -f "$tmp"
  echo "Generated $out"
}

gen_en() {
  local id="$1"
  local text="$2"
  local tmp="/tmp/${id}.aiff"
  local out="${OUT_DIR}/${id}.mp3"
  say -v Daniel "$text" -o "$tmp"
  ffmpeg -y -i "$tmp" -ac 1 -ar 24000 -b:a 48k "$out" >/dev/null 2>&1
  rm -f "$tmp"
  echo "Generated $out"
}

# Swedish Counting
gen_sv "sv_count_1" "Ett!"
gen_sv "sv_count_2" "Två!"
gen_sv "sv_count_3" "Tre!"
gen_sv "sv_count_4" "Fyra!"
gen_sv "sv_count_5" "Fem! Hurra!"

# Swedish Celebrations
gen_sv "sv_cheer" "Hurra! Du klarade banan! Bra kört!"
gen_sv "sv_bra_jobbat" "Bra jobbat!"
gen_sv "sv_jippi" "Jippi! Helt rätt!"
gen_sv "sv_superhopp" "Super-hopp!"
gen_sv "sv_stralande" "Strålande räknat!"

# Swedish Level Intros
gen_sv "sv_level_apples" "Soliga Äppel-Dalen! Hästen Harald är hungrig! Samla fem saftiga röda äpplen!"
gen_sv "sv_level_shapes" "Form-Slottet! Draken Diddi vill komma hem! Laga broarna med rätt kloss!"
gen_sv "sv_level_letters" "Bokstavs-Skogen! Apan Abbe vill lära sig läsa! Hitta rätt bokstav!"
gen_sv "sv_level_math" "Matte-Verkstaden! Byggar-Bävern Boris bygger en bro! Räkna plus-talet!"
gen_sv "sv_level_colors" "Färg-Kalas! Nalle Björn vill göra fest! Samla alla fyra färgburkarna!"
gen_sv "sv_level_beach" "Stjärn-Stranden! Kör längs stranden och samla fem glittrande stjärnor!"

# Swedish Letters
gen_sv "sv_letter_B" "B! B som i bil! Helt rätt!"
gen_sv "sv_letter_S" "S! S som i sol! Helt rätt!"
gen_sv "sv_letter_A" "A! A som i apa! Helt rätt!"
gen_sv "sv_letter_T" "T! T som i tåg! Helt rätt!"
gen_sv "sv_letter_K" "K! K som i katt! Helt rätt!"
gen_sv "sv_letter_F" "F! F som i fisk! Helt rätt!"

# Swedish Math
gen_sv "sv_math_1_1" "Strålande! Ett plus ett är två!"
gen_sv "sv_math_1_2" "Strålande! Ett plus två är tre!"
gen_sv "sv_math_2_1" "Strålande! Två plus ett är tre!"
gen_sv "sv_math_2_2" "Strålande! Två plus två är fyra!"
gen_sv "sv_math_3_1" "Strålande! Tre plus ett är fyra!"
gen_sv "sv_math_2_3" "Strålande! Två plus tre är fem!"
gen_sv "sv_math_1_4" "Strålande! Ett plus fyra är fem!"

# Swedish Hints
gen_sv "sv_hint_shape" "Vilken kloss passar i hålet? Kolla noga!"
gen_sv "sv_hint_color" "Vilken färgburk behöver vi? Hitta rätt färg!"
gen_sv "sv_hint_letter" "Vilken bokstav börjar ordet på? Lyssna noga!"
gen_sv "sv_hint_tryagain" "Kolla noga och prova igen!"
gen_sv "sv_hint_stars" "Du behöver fler stjärnor för att trimma bilen!"

# English Counting & Intros
gen_en "en_count_1" "One!"
gen_en "en_count_2" "Two!"
gen_en "en_count_3" "Three!"
gen_en "en_count_4" "Four!"
gen_en "en_count_5" "Five! Hooray!"
gen_en "en_cheer" "Hooray! You finished the track! Great driving!"
gen_en "en_bra_jobbat" "Great job!"
gen_en "en_jippi" "Yay! That's right!"
gen_en "en_superhopp" "Super jump!"
gen_en "en_stralande" "Brilliant math!"
gen_en "en_level_apples" "Sunny Apple Valley! Harold the Horse is hungry! Collect five juicy red apples!"
gen_en "en_level_shapes" "The Shape Castle! Help Diddi the Dragon fix the bridges!"
gen_en "en_level_letters" "Letter Safari! Help Abbe the Monkey find the right letter!"
gen_en "en_level_math" "Math Workshop! Help Boris the Beaver solve the plus puzzle!"
gen_en "en_level_colors" "Rainbow Color Party! Collect all four colors to paint the rainbow!"
gen_en "en_level_beach" "Starlight Beach! Collect five golden glittering stars!"

# Swedish Animal Friends
gen_sv "sv_cat_misse" "Mjau! Hej kompis, jag heter Katten Misse! Ska vi rejsa?"
gen_sv "sv_dog_buster" "Voff voff! Hej där! Jag heter Hunden Buster och jag älskar att köra fort!"
gen_sv "sv_moose_helge" "Mööö! Hej från älgen Helge! Kör lugnt och fint i skogen!"
gen_sv "sv_fox_rune" "Tjoho! Jag heter räven Rune! Vilken superfin bil du kör!"

# English Animal Friends
gen_en "en_cat_misse" "Meow! Hello buddy, I am Misse the Cat! Shall we race?"
gen_en "en_dog_buster" "Woof woof! Hello there! I am Buster the Dog and I love driving fast!"
gen_en "en_moose_helge" "Mooo! Hello from Helge the Moose! Drive safe and gentle through the forest!"
gen_en "en_fox_rune" "Yahoo! I am Rune the Fox! What a wonderful car you are driving!"

# Safari Photo Camera
gen_sv "sv_photo_snap" "Klick! Vilket jättefint safari-foto till ditt album!"
gen_en "en_photo_snap" "Click! What a wonderful safari photo for your album!"

echo "All voice files generated successfully!"
