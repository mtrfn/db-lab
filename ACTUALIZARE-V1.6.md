# DB-Lab V1.6.0 — editor grafic pentru proiectarea ERD

## Instalare

1. Exportă proiectele importante din versiunea curentă și păstrează configurația microsoft-config.js.
2. Încarcă întregul conținut al folderului db-lab din arhivă în **mtrfn/db-lab**, nu în html-lab. Păstrează structura directoarelor vendor și teams-icons.
3. Așteaptă publicarea GitHub Pages, apoi redeschide aplicația. Verifică antetul **V1.6.0** și fila **Proiectare ERD**.
4. Fila Teams existentă folosește același URL. Nu sunt necesare permisiuni noi față de V1.5.1 și nu trebuie reinstalată fila. Manifestul 1.6.0 este disponibil pentru actualizarea opțională a descrierii aplicației.

Configurația Microsoft din pachet este cea folosită în V1.5.1. Nu modifica identificatorii aplicației pentru această actualizare.

## Două diagrame, două roluri

- **Proiectare ERD**: schița editabilă a viitoarei baze. Are propriile tabele și relații; editarea nu execută SQL asupra bazei curente.
- **Diagramă ERD**: vizualizarea structurii reale a bazei SQLite, după executarea SQL-ului.

Schema de proiectare generează SQL. SQL-ul scris liber în Editor SQL nu modifică automat proiectarea; folosește explicit Pornește din baza curentă pentru a copia structura rezultată.

## Construirea schemei

1. Deschide Proiectare ERD și apasă **+ Tabel**. Fiecare tabel nou pornește cu un câmp id INTEGER, cheie primară.
2. Selectează tabelul printr-un clic pe antet sau din lista de sub diagramă. Editează numele tabelului și câmpurile în formularul de dedesubt. Modificările din text sunt preluate la ieșirea din câmp.
3. Adaugă câmpuri cu **+ Câmp**; alege tipul SQLite și bifează PK, Obligatoriu sau Unic.
4. Mută tabelele trăgând de antet. Cu tastatura, selectează antetul cu Tab și folosește săgețile. Zoom, Încadrează și Aranjare automată ajută la navigare.
5. Pentru o relație simplă, apasă **Conectează câmpuri**, apoi selectează câmpul FK din tabelul copil și cheia PK sau UNIQUE din tabelul părinte. Cele două câmpuri trebuie să aibă același tip în proiectare.
6. Pentru chei compuse, deschide **Relații și chei compuse**. Selectează tabelele și același număr de câmpuri, cu Ctrl / Cmd pentru selecție multiplă. Corespondența urmează ordinea câmpurilor în cele două liste. Pentru o altă ordine, proiectează câmpurile în ordinea dorită sau folosește SQL după creare.
7. Relațiile se pot șterge din listă și recrea. Ștergerea unui câmp sau tabel cere confirmare și elimină relațiile dependente numai din diagramă.

Numele sunt citate în SQL. Verificarea respinge nume goale / duplicate, referințe lipsă, chei părinte nevalide și tipuri incompatibile. Un proiect incomplet poate fi salvat; crearea bazei rămâne blocată până la corectarea erorilor.

## Cardinalități

- **1:N**: mai multe înregistrări copil pot referi același părinte.
- **1:1**: câmpurile FK includ o cheie unică a copilului, deci un părinte poate avea cel mult un copil corespunzător.
- **N:M**: asistentul creează un tabel de legătură cu două FK și o cheie primară compusă. Necesită două tabele distincte cu chei primare simple. Poți redenumi câmpurile stanga_id și dreapta_id după creare.

Marcajele descriu cardinalitatea maximă. FK obligatorie înseamnă că un copil trebuie să aibă un părinte; FK opțională poate fi NULL. Un părinte poate avea zero copii chiar dacă FK din copil este obligatorie. Pentru FK compuse, lipsa obligativității tuturor componentelor permite și valori parțial NULL conform SQLite. Editorul nu impune participare totală pe partea părinte.

PK este generată cu NOT NULL pentru fiecare componentă. Pentru câmpuri INTEGER PRIMARY KEY simple, SQLite poate genera automat valoarea când este omisă la INSERT; editorul nu generează AUTOINCREMENT.

## Exemplu inclus

Importă în **Proiectare ERD → Import diagramă** fișierul **exemplu-proiectare-biblioteca.erd.json**. Conține autori, carti și autori_carti pentru relația N:M dintre autori și cărți. Importul diagramei nu înlocuiește baza cu date.

## Crearea bazei

SQL-ul generat apare în partea de jos. Poate fi exportat separat.

**Creează o bază nouă din diagramă** cere confirmare, verifică schema într-o bază temporară și apoi înlocuiește baza deschisă cu noua bază goală. Nu este o migrare a datelor și nu păstrează în noua bază înregistrările existente. Exportă proiectul curent înainte de confirmare dacă vrei să-l păstrezi.

La eroarea de verificare, baza curentă nu se schimbă. La succes, aplicația iese din lecția activă și deschide un proiect liber „Proiect din diagramă”; progresul lecției a fost salvat înainte. SQL-ul DDL rămâne în previzualizarea proiectării. Editorul SQL este pregătit pentru interogări noi, pentru a evita executarea accidentală a acelorași CREATE TABLE din nou.

## Salvare, export și Teams

Diagrama și pozițiile se salvează automat în același proiect local, separat de baza cu date. În Teams, proiectul rămâne separat pe cont și clasă; lecțiile își păstrează proiectele proprii.

- **Export diagramă**: fișier DB-Lab-design, pentru schimbul unei scheme fără baza cu date.
- **Export proiect**: fișier DB-Lab care include și schema de proiectare.
- **Teme Teams → Atașează proiectul curent**: include și diagrama, chiar dacă baza nu a fost încă generată. Profesorul importă fișierul în V1.6 și deschide Proiectare ERD pentru verificare.

O modificare a diagramei după atașare necesită reatașarea proiectului înainte de predare. Proiectele vechi se deschid cu o diagramă de proiectare goală. Versiunile mai vechi ale aplicației nu păstrează componenta nouă la reexport; folosește V1.6 pentru lucrări cu proiectare.

## Pornirea din baza curentă

Funcția copiază câmpurile obișnuite, PK, UNIQUE simple/compuse fără expresii și fără filtru și relațiile FK rezolvabile. Tipurile declarate se reduc la cele cinci afinități SQLite.

Nu copiază date, câmpuri generate, DEFAULT, CHECK, COLLATE, triggere, view-uri, indexuri parțiale, expresii în indexuri sau acțiuni ON DELETE / ON UPDATE. Cheile UNIQUE compuse preluate apar ca informație sub formular; V1.6 nu oferă un editor separat pentru aceste constrângeri. Aceasta este o bază pentru reproiectare, nu o copie exactă a tuturor proprietăților SQL. Dialogul avertizează înainte de înlocuirea schiței.

## Limite și verificare

Maximum 60 de tabele, 80 de câmpuri/tabel, 200 de relații; import diagramă maximum 2 MB. Nu există undo/redo în V1.6; exportă variante înainte de modificări ample.

Verificat prin executarea SQL-ului generat în SQLite real (sql.js), teste pentru FK simple/compuse, unicitate, N:M, salvare/restaurare, izolare la verificarea SQL și dialoguri de confirmare, plus regresiile versiunilor anterioare. Testele de interfață folosesc un DOM simulat; nu s-a efectuat verificare vizuală în browser sau o predare reală din noua versiune în tenantul școlii.

Pilot recomandat: importă exemplul, mută un tabel, reîncarcă pagina și verifică poziția; creează baza goală; verifică cele trei tabele în Structură și Diagramă ERD; exportă și reimportă proiectul; dintr-un cont de elev atașează și predă, apoi verifică proiectarea în contul profesorului.
