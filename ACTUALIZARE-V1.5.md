# DB-Lab V1.5.0 — predarea proiectelor în Teams

## 1. Actualizează site-ul

1. Păstrează o copie a configurației microsoft-config.js și exportă lucrările importante.
2. Deschide repository-ul **mtrfn/db-lab** (nu html-lab).
3. Încarcă întregul conținut din folderul db-lab al arhivei, păstrând directoarele vendor și teams-icons. Nu încărca folderul db-lab în interiorul altui folder db-lab.
4. Păstrează identificatorii Microsoft existenți. Arhiva include configurația furnizată anterior; nu conține parole sau client secret.
5. Așteaptă finalizarea GitHub Pages. Verifică versiunea **V1.5.0** și fila **Teme Teams**. Reîncarcă fila DB-Lab în Teams.

Manifestul nou are versiunea 1.5.0 și păstrează ID-ul aplicației. Fila deja instalată încarcă același site, deci nu trebuie eliminată/reinstalată. Actualizarea opțională a pachetului Teams se face din CONFIGURARE-TEAMS.html; nu încărca arhiva completă a site-ului în Teams Admin Center.

## 2. Aprobă permisiunile în Entra

În https://entra.microsoft.com → App registrations → **DB-Lab**, deschide:
**API permissions → Add a permission → Microsoft Graph → Delegated permissions**.

Adaugă:
- **EduAssignments.ReadWrite** — operații asupra temelor/lucrărilor în numele contului conectat; necesară pentru pregătirea folderului și predare.
- **Files.ReadWrite.All** — încărcarea proiectului în folderul SharePoint al lucrării. Această permisiune acoperă toate fișierele accesibile utilizatorului, nu numai proiectele DB-Lab; codul de predare folosește folderul lucrării identificat de Microsoft.

Păstrează User.Read, EduRoster.ReadBasic și Files.Read.All folosite de conectarea și biblioteca existente. Apasă **Grant admin consent** cu un cont autorizat. Nu adăuga permisiuni Application și nu crea client secret. Aprobarea aplicației în Teams Admin Center este distinctă de acest consimțământ.

Permisiunile de predare sunt cerute la utilizarea filei Teme Teams; lipsa lor nu schimbă fluxul existent de conectare și lecții. Închide și redeschide sesiunea DB-Lab după aprobare dacă primești încă eroare de acces.

## 3. Profesorul pregătește tema

În clasa Teams, creează o temă individuală și atribuie-o elevilor. Permite adăugarea de resurse de către elevi. Lecția din DB-Lab/lectii.json și tema Teams sunt obiecte diferite: elevul alege explicit tema la care predă. V1.5 nu creează, nu atribuie și nu notează teme.

## 4. Elevul predă

1. Intră în fila DB-Lab din canalul standard al clasei și conectează-te la Microsoft.
2. Lucrează la proiect / lecție. Execută SQL-ul dorit și verifică rezultatul.
3. În **Teme Teams**, apasă **Încarcă temele clasei** și selectează tema.
4. Apasă **Atașează proiectul curent** și confirmă numele proiectului și tema.
5. Verifică mesajul „Proiect atașat”. Acest pas nu predă tema.
6. Apasă **Predă tema** și confirmă. Mesajul „Lucrarea a fost predată” și starea „Predată” apar numai după confirmarea Microsoft.

Se trimite un fișier .dblab.json care păstrează formatul Import existent: SQLite, SQL-ul curent din editor, numele proiectului și metadatele lecției / nivelul maxim de ajutor consultat. SQL-ul din editor nu se execută automat. Diagrama ERD se reconstruiește din baza primită; pozițiile temporare nu sunt incluse.

Numele fișierului conține amprenta SHA-256 a proiectului. O reîncercare cu aceeași copie nu creează un al doilea atașament. Un proiect modificat se atașează ca versiune nouă; versiunile anterioare nu sunt șterse automat. Predarea trimite toate resursele din lista lucrării. Dacă vrei să elimini o versiune veche, folosește Teams înainte de predare și actualizează starea în DB-Lab.

Proiectul curent trebuie să corespundă unui atașament pentru a-l preda din DB-Lab. Dacă ai editat după atașare, atașează din nou. Modificările locale după predare nu actualizează lucrarea trimisă. Pentru corecturi folosește **Anulează predarea** în Teams, actualizează starea și atașează noua versiune.

## 5. Profesorul verifică

În Teams → tema respectivă → lucrarea elevului, descarcă fișierul .dblab.json. În DB-Lab, exportă mai întâi proiectul propriu dacă trebuie păstrat, apoi folosește **Import**. Sunt disponibile SQL-ul elevului, structura, datele, diagrama ERD și metadatele lecției. Importul nu execută automat SQL-ul din editor. Evaluarea și feedbackul se fac în Teams. Nivelul de ajutor din proiect este informativ, nu o dovadă de evaluare securizată.

## Limite și recuperare

- Teme individuale în clase Teams, canal standard; temele de grup nu sunt suportate.
- Maximum 20 MB pentru fișierul JSON generat; JSON poate fi mai mare decât baza SQLite.
- Atașarea este o copie punctuală, nu o sincronizare continuă între dispozitive.
- În afara Teams rămân disponibile funcțiile locale; conectarea Teams este necesară pentru predare.
- La întreruperea conexiunii, folosește **Actualizează starea** înainte să repeți operația. Microsoft poate să fi procesat cererea chiar dacă răspunsul nu a ajuns. Nu este afișat succes presupus.
- 403: verifică permisiunile delegate, consimțământul și accesul elevului la temă; 404: actualizează lista; tema închisă: verifică termenul și setările în Teams.

## Verificare înainte de folosirea cu întreaga clasă

Codul a fost verificat prin teste automate cu răspunsuri Microsoft simulate, plus testele SQLite / lecții / ERD existente. Nu a fost executată o predare reală în tenantul școlii și nu a fost făcut un test vizual într-un browser autentificat.

Pilot: creează o temă de test, intră cu un elev, atașează, verifică faptul că starea este încă nepredată, predă, reîncarcă aplicația și verifică starea Predată. Cu profesorul, descarcă și importă proiectul; compară SQL-ul și datele. Verifică și funcționarea lecțiilor clasei și blocarea atelierului pentru elev.

Referințe Microsoft:
- https://learn.microsoft.com/en-us/graph/education-upload-resource-overview
- https://learn.microsoft.com/en-us/graph/api/educationsubmission-setupresourcesfolder?view=graph-rest-1.0
- https://learn.microsoft.com/en-us/graph/api/educationsubmission-post-resources?view=graph-rest-1.0
- https://learn.microsoft.com/en-us/graph/api/educationsubmission-submit?view=graph-rest-1.0
