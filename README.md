# DB-Lab V1.1.1 — corecție încărcare fișiere

Fișierele CSS, JavaScript și Worker folosesc acum adrese cu versiune pentru a evita reutilizarea copiilor V1.0 din cache. Datele și formatul proiectului rămân neschimbate.

Încarcă întregul conținut al folderului db-lab peste fișierele existente, inclusiv row-editor.js și worker.js. Așteaptă publicarea, închide dialogul vechi cu Anulează și apasă Ctrl + F5. Antetul trebuie să afișeze V1.1.1. Nu este necesară ștergerea datelor browserului.

# DB-Lab V1.1

Laborator educațional SQLite în limba română, care rulează integral în browser, fără server de aplicație sau CDN. Include motorul sql.js și fișierul WASM local.

## Noutăți

- Formulare de adăugare și editare în locul dialogurilor JSON.
- Pentru fiecare câmp: Valoare, NULL și, la adăugare, Implicit / automat. Acest ultim mod omite coloana din INSERT, astfel încât SQLite aplică valoarea implicită sau generează identificatorul. Textul gol rămâne distinct de NULL.
- Alegere Text / Număr; textul poate avea mai multe linii. Câmpurile nemodificate nu sunt rescrise la editare.
- Liste de chei externe cu identificator și o etichetă text, când există. Lista citește toate referințele, inclusiv cele de după primele 200 de rânduri. Cheile compuse se aleg împreună; REFERENCES fără coloane explicite folosește cheia primară a tabelului părinte. Valorile pot fi introduse și manual, fiind validate de SQLite.
- Previzualizare SQL actualizată înainte de Aplică, fără modificarea editorului SQL. Execuția folosește parametri; previzualizarea afișează valorile citabile echivalente.
- Anulează / Escape închide formularul fără salvare. La eroare, datele introduse rămân disponibile pentru corectare, iar baza revine la starea anterioară.

## Compatibilitate V1.0

Formatul `.dblab.json` rămâne `format: DB-Lab`, `version: 1`, cu aceleași câmpuri name, sql și bytes. V1.1 importă proiectele V1.0; exporturile V1.1 păstrează formatul citit de V1.0. Nu este necesară conversia bazei. Exportul `.sqlite` rămâne neschimbat.

IndexedDB păstrează numele `db-lab-v1`, versiunea 1 și înregistrarea `projects/active`. Pe aceeași origine și în același profil de browser, proiectul local este restaurat. Exportă totuși o copie înaintea actualizării.

## Actualizare / publicare pe GitHub Pages

1. Exportă proiectul curent ca rezervă.
2. În repository, înlocuiește fișierele aplicației cu **conținutul** directorului `db-lab` din arhivă; include noul `row-editor.js` și păstrează directorul `vendor`.
3. Păstrează `index.html` în directorul publicat. Pentru o instalare nouă: Settings → Pages → Deploy from a branch → main / (root).
4. După publicare, reîncarcă pagina complet pentru a primi toate fișierele V1.1. Poți importa copia V1.0 dacă este necesar.

Toate resursele au căi relative, compatibile cu publicarea într-un subdirector de repository. Nu este necesară compilarea. Pachetul este pregătit pentru GitHub Pages; această livrare nu publică repository-ul.

Probă locală din directorul `db-lab`: `python -m http.server 8000`, apoi deschide http://localhost:8000. Deschiderea directă prin `file://` nu este suportată.

## Verificări

Din directorul `db-lab`, cu Node.js instalat:

```
node test-worker.cjs
node test-v11.cjs
```

Testele verifică motorul inclus: catalog, sincronizare structură/date, rollback, chei externe simple/compuse/implicite, peste 200 de referințe, insert/update, schimbarea PK, NULL/text gol/default, coloane generate, export/import cu formatul V1.0 și citarea SQL.

Verificat în browser: adăugare cu apostrof și referință aleasă din listă, editare, eroare NOT NULL cu păstrarea formularului și corectare. Aceste verificări nu echivalează cu o publicare live pe GitHub Pages.

## Limite

Grila afișează 200 de rânduri, rezultatele SQL 500; folosește LIMIT pentru interogări mari. Listele FK pot deveni mari. Importul este limitat la 20 MB și operațiile la 15 secunde.

Editarea și ștergerea vizuală necesită cheie primară nenulă și rând fără valori binare BLOB. Câmpurile generate nu se editează. Pentru valori binare și întregi dincolo de precizia sigură JavaScript folosește editorul SQL. SQLite validează NOT NULL, UNIQUE, CHECK și relațiile la aplicare.

Salvarea locală aparține profilului browserului. Exportă periodic. Schimbările structurale complexe se fac în SQL. Licența sql.js este inclusă în vendor; versiunea distribuită este descrisă în VENDOR-VERSION.txt.
