WIP👪 Familie Recepten
Een Next.js–webapplicatie om familie­recepten te delen, bij te houden, te bewerken, favorieten toe te voegen en gezamenlijk te beheren in groepen.

🚀 Voor wie is dit?
Gezinnen of vriendengroepen die samen recepten willen verzamelen & delen

Contactloos en mobiel — ontworpen met Next.js, Firebase en moderne UI

🗂️ Belangrijkste functionaliteit
Aanmelden via e‑mail + wachtwoord of Google (met opslag in Firestore)

CRUD voor recepten: privé, publiek en gedeeld

Favorieten: markeer recepten en filter ze later

Groepen aanmaken:

Leden uitnodigen op e‑mail

Groepslidmaatschap beheren (verwijderen, verlaten)

Rechtenmodel: alleen groepsleden zien elkaars privé‑recepten

Weekmenu en Boodschappenlijst worden later toegevoegd, met groepsopslag & bewerkbaarheid

🛠️ Technologieën
Next.js 14 (app router / React Server Components)

Frontend UI — Tailwind CSS + Lucide‑react + Shadcn/UI componenten

Firebase: Authentication, Firestore, Storage

Sonner voor toast‑meldingen

🚧 Getting started
Fork of clone deze repo

npm install om dependencies te installeren

Maak een .env.local in root met Firebase‑configura­tie:

env
Kopiëren
Bewerken
NEXT_PUBLIC_FIREBASE_API_KEY=…
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=…
NEXT_PUBLIC_FIREBASE_PROJECT_ID=…
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=…
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=…
NEXT_PUBLIC_FIREBASE_APP_ID=…
npm run dev start de dev‑server op http://localhost:3000

✅ Tips voor gebruik
Na registratie kun je in je Profielpagina:

Je avatar zien

Groepen beheren: aanmaken, leden uitnodigen/verwijderen, naam wijzigen

In Recepten zie je:

Eigen recepten (prive + publiek)

Publieke recepten van anderen

Privé‑recepten van groepsleden als je binnen een groep zit

Filter-/zoekcomponent volgt binnenkort

Favorieten vind je straks terug op jouw Profiel

🧭 Roadmap
Zoek & filter op meerdere categorieën en favoriete recepten

Weekmenu‑module: plan recepten per dag en deel ze in groepen

Boodschappenlijst‑module: genereer lijst vanuit weekmenu; groepsdeelbaarheid

Recept delen individueel buiten groepen via e‑mail uitnodiging

UI‑verbeteringen & eventuele mobile‑app

👩‍💻 Contributie
Suggesties, bugs of verbeteringen? Open gerust een issue of stuur een PR!
