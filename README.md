# DB-Lab V1.0
Laborator educațional SQLite în limba română. Editor SQL, structură vizuală sincronizată, constructor de tabele și grilă de date. Catalog școlar fictiv, salvare IndexedDB, import/export proiect JSON și SQLite.

## Publicare pe GitHub Pages
1. Creează un repository nou numit `db-lab` în contul GitHub.
2. Dezarhivează pachetul și încarcă **conținutul** directorului db-lab în rădăcina repository-ului. index.html trebuie să fie în rădăcină; păstrează directorul vendor și toate fișierele.
3. Settings → Pages → Build and deployment → Deploy from a branch.
4. Branch: main; folder: /(root); Save.
5. După publicare, adresa pentru contul mtrfn va fi https://mtrfn.github.io/db-lab/ . Aceasta este adresa estimată, nu o publicare efectuată de autorul pachetului.
6. Deschide pagina și execută interogarea inițială; trebuie să apară 4 elevi.

Nu deschide index.html prin dublu clic (file://). Aplicația folosește Worker, WASM și fetch și trebuie servită prin HTTP/HTTPS.
Pentru probă locală: `python -m http.server 8000` din directorul db-lab, apoi http://localhost:8000 .

## Probă recomandată
- Creează vizual carti cu id INTEGER PK și denumire TEXT.
- În Date adaugă {"denumire":"SQL pentru elevi"}; elimină id sau lasă-l null pentru generare automată.
- Rulează SELECT * FROM carti și verifică înregistrarea.
- Creează un tabel prin SQL și verifică lista din stânga.
- Încearcă o referință invalidă în elevi: operația trebuie respinsă.
- Exportă proiectul, reîncarcă pagina și importă proiectul într-un alt browser.
- Verifică afișarea pe telefon și butonul Oprește pentru o interogare lungă.

## Limite V1.0
- SQLite, nu MySQL. Fără conturi, Teams, lecții/evaluare automată sau ERD deplasabil.
- Modificările structurale vizuale: creare, redenumire tabel/câmp, adăugare câmp simplu. PK și FK se definesc la crearea tabelului; schimbările complexe folosesc SQL.
- Datele se editează printr-un formular JSON simplu în dialogul browserului. Editare/ștergere numai pentru rânduri cu cheie primară nenulă și fără BLOB. Nu există editare vizuală BLOB.
- Grila arată primele 200 de rânduri, rezultatele SQL primele 500. Motorul materializează întregul rezultat SQL, deci folosește LIMIT pentru volume mari.
- Import maxim 20 MB; interogări oprite după 15 secunde. Nu este destinată bazelor mari.
- Export/import proiect .dblab.json păstrează baza și textul SQL; export .sqlite păstrează numai baza.
- Salvarea aparține profilului browserului; ștergerea datelor browserului o poate elimina. Exportă periodic.
- Interfața nu suprascrie SQL-ul elevului când generează SQL vizual.

## Verificare efectuată
Sintaxa JavaScript și teste reale ale motorului sql.js: catalog, actualizarea structurii/date, chei externe, revenire după script cu eroare, parametri, export/import, redenumire. Interfața, IndexedDB și oprirea Worker necesită probă în browser; acestea nu au fost verificate automat în această sesiune.

## Dependențe
sql.js și binarul WASM sunt incluse local, fără CDN la rulare. Versiunea motorului este cea din binarul distribuit; vezi VENDOR-VERSION.txt. Licență sql.js inclusă în vendor; SQLite este în domeniul public.
