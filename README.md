# ⛩️ ONITAMA - The Way of the Warrior (PWA Master Edition)

Un'edizione definitiva, completa, interattiva e standalone del celebre gioco da tavolo **Onitama**.

---

## 🌟 Novità & Caratteristiche Principali

* **🏯 Schermata Iniziale & Asset Dedicati:**
  * Logo calligrafico ufficiale in SVG vettoriale (`assets/logo.svg`).
  * Menu iniziale: *Gioca Ora*, *Regole del Tempio*, *Statistiche & Storico*, *Opzioni & IA Key*, *Esci*.
* **🎎 Rituale di Preparazione & Animazione Carte:**
  * Selezione e personalizzazione dei nomi dei giocatori.
  * Animazione di mescolamento e rivelazione cadenzata delle 5 carte dal mazzo.
  * Estrazione della 5ª carta Neutra con assegnazione immediata del primo turno.
* **🎵 Musica Giapponese Tradizionale Seamless (Web Audio API):**
  * Sintetizzatore procedurale in scala *Hirajoshi* (Koto pizzicato + Flauto Shakuhachi).
  * Loop infinito con divisione metrica e clock audio nativo (nessun taglio o interruzione percepibile).
* **🤖 Livelli di Difficoltà CPU & Integrazione Google Gemini API:**
  * **Modalità CPU:** *Discepolo (Facile)*, *Monaco (Medio)*, *Sensei (Difficile)* con Minimax ed euristica posizionale.
  * **Modalità Gemini AI:** *Facile*, *Medio*, *Sensei Difficile* con supporto diretto per la tua chiave API Google Gemini.
* **🧊 Modalità 2D e 3D con Tre Dimensioni:**
  * Passaggio istantaneo tra la plancia vettoriale 2D ad alta risoluzione e la plancia 3D interattiva in Three.js con pezzi cilindrici intagliati, ombre e illuminazione direzionale.
* **📱 PWA & Banner Installazione Android Fullscreen:**
  * Banner nativo per l'installazione a schermo intero senza barre del browser.
* **📜 Storico Mosse & Statistiche Resettabili:**
  * Cronologia delle mosse della partita in corso.
  * Statistiche persistenti delle vittorie consultabili e azzerabili.
* **⏱️ Movimenti e Passaggi Cadenzati:**
  * Delay e animazioni fluide per visualizzare chiaramente le mosse della CPU/IA e lo scambio delle carte.

---

## 🚀 Come Pubblicare su GitHub Pages (Gratuito)

1. Crea una nuova repository su GitHub denominata `onitama-pwa`.
2. Estrai il file `.zip` e carica tutti i file nella root della repository:
   ```bash
   git init
   git add .
   git commit -m "feat: complete master edition onitama pwa"
   git branch -M main
   git remote add origin https://github.com/TUO-USERNAME/onitama-pwa.git
   git push -u origin main
   ```
3. Vai in **Settings > Pages > Build and deployment > Source**, seleziona `Deploy from a branch` (Branch: `main`, cartella `/ (root)`) e clicca su **Save**.
4. Il gioco sarà disponibile su `https://TUO-USERNAME.github.io/onitama-pwa/`.
