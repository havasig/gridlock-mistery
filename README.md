# Murdoku párbaj

Logikai gyilkossági rejtvények két (vagy több) játékosnak. Statikus weboldal: nincs szerver, nincs fiók, nincs adatbázis. 20 saját feladvány 4 szinten (Kezdő 6×6, Könnyű 8×8, Közepes 10×10, Nehéz 12×12), mindegyik egyértelmű megoldással.

## Közzététel GitHub Pages-en (kb. 3 perc)

1. GitHubon hozz létre egy új, **public** repót, pl. `murdoku`.
2. Töltsd fel a három fájlt: `index.html`, `puzzles.js`, `README.md`
   (Add file → Upload files → húzd be őket → Commit changes).
3. Settings → Pages → *Build and deployment* → Source: **Deploy from a branch**,
   Branch: **main**, mappa: **/(root)** → Save.
4. Egy-két perc múlva elérhető: `https://<felhasználóneved>.github.io/murdoku/`

Tipp: telefonon nyisd meg, majd böngészőmenü → „Hozzáadás a kezdőképernyőhöz”, így appként indul.

Helyben kipróbálni: a mappában `python -m http.server 8000`, majd `http://localhost:8000`.

## Hogyan működik

- **Játékosok:** a kezdőlapon add meg a neved. Egy eszközön több játékos is lehet.
- **Haladás:** minden lépés, a jelölések és a stopper automatikusan mentődik a böngészőbe, játékosonként és feladványonként. Ha félúton abbahagyod, ott folytatod.
- **Stopper:** csak akkor megy, ha a feladvány nyitva van és az oldal látszik (háttérben vagy bezárva megáll).
- **Ellenőrzés:** megmondja, hány bábu áll rossz helyen. Minden sikertelen ellenőrzés +30 mp büntetés.
- **Pontidő** = idő + 30 mp × sikertelen ellenőrzések. Feladványonként a kisebb pontidő nyer.
- **Összehasonlítás külön telefonon:** „Eredményeim küldése” → elküldöd a linket a másiknak → ha megnyitja, a te eredményeid bekerülnek az ő táblázatába. Ezt bármikor újra lehet küldeni, a frissebb felülírja a régit.
- **Egy eszközön játszva** nem kell semmit küldeni, a táblázat mindenkit mutat.

## Fontos tudnivalók

- Az adatok a böngészőben vannak (localStorage). Ha törlöd a böngészési adatokat, vagy másik böngészőt/eszközt használsz, a haladás nem jön át.
- A megoldások a `puzzles.js`-ben csak SHA-256 lenyomatként szerepelnek, így ránézésre nem olvashatók ki. Egy elszánt fejlesztő kis munkával visszafejthetné, de egymás közti játékra ez bőven elég.
- Új feladványokat a `puzzles.js` bővítésével lehet hozzáadni (a meglévők mintájára; mindegyik egyértelmű megoldással).
