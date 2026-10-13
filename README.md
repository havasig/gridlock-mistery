# Gridlock

Logikai gyilkossági rejtvények két (vagy több) játékosnak, stopperrel és összehasonlítással.
Statikus weboldal: nincs szerver, nincs fiók, nincs adatbázis.

**Játék:** https://havasig.github.io/gridlock-mistery/

20 saját feladvány 4 szinten (Kezdő 6×6, Könnyű 8×8, Közepes 10×10, Nehéz 12×12), mindegyik egyértelmű megoldással.

A játékmenetet Manuel Garand [Murdoku](https://murdoku.com) feladványai ihlették. Minden itt szereplő feladvány saját készítésű; a projekt nem kapcsolódik a Murdokuhoz.

## Hogyan működik

- **Játékosok:** a kezdőlapon add meg a neved. Egy eszközön több játékos is lehet.
- **Haladás:** minden lépés, jelölés és a stopper automatikusan mentődik a böngészőbe, játékosonként és feladványonként.
- **Stopper:** csak akkor megy, ha a feladvány nyitva van és az oldal látszik.
- **Ellenőrzés:** megmondja, hány bábu áll rossz helyen. Minden sikertelen ellenőrzés +30 mp.
- **Tipp:** megmutatja a következő logikai lépést és a technikát (egyetlen jelölt, rejtett egyes, zárt csoport, viszonylagos nyom, áldozat-szabály, ellentmondás). Kérésre a mezőt is. Mindkettő +30 mp. Ha valaki rossz helyen van, ezt jelzi először.
- **Pontidő** = idő + 30 mp × (sikertelen ellenőrzések + tippek). Feladványonként a kisebb pontidő nyer.
- **Eredmények összevetése külön telefonon:** „Eredményeim küldése” → a másik megnyitja a linket → bekerülsz az ő táblázatába.
- **Folytatás másik eszközön:** „Haladás átvitele linkkel” → küldd el magadnak → nyisd meg a másik eszközön. Ahol mindkét helyen van haladás, a frissebb marad. Fájlba mentés és visszatöltés is van.

## Fontos tudnivalók

- Az adatok a böngészőben vannak (localStorage). Böngészési adatok törlése, privát ablak vagy másik böngésző esetén nem látszanak – ilyenkor az átviteli link vagy a mentésfájl segít.
- iPhone-on érdemes a kezdőképernyőre tenni (Megosztás → Főképernyőhöz adás), különben a Safari 7 nap használaton kívül törölheti az adatokat.
- A megoldások a `puzzles.js`-ben csak SHA-256 lenyomatként szerepelnek.

## Helyi futtatás

```
python -m http.server 8000
```
majd http://localhost:8000
