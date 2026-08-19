# 🥋 Onitama Digital - Progressive Web App (PWA)

Un'implementazione completa, fedele, reattiva e installabile (PWA) del celebre gioco da tavolo **Onitama**.

---

## 🌟 Caratteristiche Principali
* **100% Fedele alle Regole Ufficiali:** Include le 16 carte originali complete di stamp iniziale, griglia di movimento e condizioni di vittoria (*Via della Pietra* e *Via del Ruscello*).
* **Asset Grafici SVG Standalone:** 16 carte compatte verticali in SVG, 4 pezzi vettoriali (Maestri e Allievi con 2 soli colori), plancia 5x5 e icone PWA.
* **Modalità di Gioco:**
  * 🤼 **1 vs 1 Locale (Pass & Play):** Gioca contro un amico sullo stesso schermo/tablet/smartphone.
  * 🤖 **Contro IA (Maestro Zen & Sensei Esperto):** Algoritmo euristico per sfidare il computer a due livelli di difficoltà.
* **Zero Dipendenze Esterne:** Funziona completamente offline, con sintesi audio integrata tramite Web Audio API.
* **PWA Installabile:** Supporto Service Worker (`sw.js`) e Web App Manifest (`manifest.json`).

---

## 📁 Struttura della Repository
```
.
├── index.html                  # Interfaccia grafica completa, motore di gioco e logica IA
├── manifest.json               # Configurazione PWA per l'installazione su iOS/Android/Desktop
├── sw.js                       # Service Worker per il salvataggio in cache offline
├── README.md                   # Documentazione di setup e guida GitHub
└── assets/
    ├── board.svg               # Grafica della plancia 5x5 in stile tempio
    ├── cards_data.json         # Dataset vettoriale e metadati delle 16 carte
    ├── cards/                  # 16 Carte SVG individuali
    │   ├── tiger.svg
    │   ├── dragon.svg
    │   ├── frog.svg
    │   ├── rabbit.svg
    │   ├── crab.svg
    │   ├── elephant.svg
    │   ├── goose.svg
    │   ├── rooster.svg
    │   ├── monkey.svg
    │   ├── mantis.svg
    │   ├── horse.svg
    │   ├── ox.svg
    │   ├── crane.svg
    │   ├── boar.svg
    │   ├── eel.svg
    │   └── cobra.svg
    ├── pieces/                 # 4 Pezzi SVG (2 Colori: Blu vs Rosso)
    │   ├── master-blue.svg
    │   ├── student-blue.svg
    │   ├── master-red.svg
    │   └── student-red.svg
    └── icons/                  # Icone applicazione PWA
        ├── icon-192.svg
        └── icon-512.svg
```

---

## 🚀 Come Pubblicare su GitHub Pages (Gratuito e Immediato)

1. **Crea un nuovo repository su GitHub:**
   * Nome suggerito: `onitama-pwa`.
   * Imposta la visibilità su **Public**.
2. **Carica tutti i file:**
   * Trascina l'intero contenuto estratto dallo zip nella root del tuo repository GitHub oppure usa Git:
   ```bash
   git init
   git add .
   git commit -m "feat: release Onitama PWA complete package"
   git branch -M main
   git remote add origin https://github.com/TUO-USERNAME/onitama-pwa.git
   git push -u origin main
   ```
3. **Abilita GitHub Pages:**
   * Vai nelle **Settings** del tuo repository su GitHub.
   * Seleziona la scheda **Pages** nella barra laterale sinistra.
   * Sotto **Build and deployment > Source**, seleziona `Deploy from a branch`.
   * Imposta il Branch su `main` e la cartella su `/ (root)`, poi clicca su **Save**.
4. **Gioca:**
   * Dopo 1 minuto il gioco sarà live all'indirizzo `https://TUO-USERNAME.github.io/onitama-pwa/`.

---

## 📜 Regole del Gioco

### Componenti
* **Plancia 5x5:** Con casella Tempio Sud `(2,0)` per il Giocatore 1 (Blu) e Tempio Nord `(2,4)` per il Giocatore 2 (Rosso).
* **Pezzi:** 1 Maestro + 4 Allievi per giocatore.
* **Carte:** 5 carte estratte casualmente su 16 (2 a P1, 2 a P2, 1 Neutra al lato).
* **Primo Giocatore:** Chi corrisponde al colore dello stamp della Carta Neutra.

### Flusso del Turno
1. Seleziona una delle tue 2 carte in mano.
2. Muovi uno dei tuoi pezzi secondo uno dei vettori validi della carta.
3. Se atterri su un pezzo avversario, quest'ultimo viene eliminato dal gioco.
4. La carta giocata viene scambiata con la carta Neutra al lato.

### Condizioni di Fine Partita
1. **Via della Pietra:** Cattura il Maestro dell'avversario.
2. **Via del Ruscello:** Raggiungi con il tuo Maestro la casella Tempio iniziale dell'avversario.
