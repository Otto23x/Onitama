# ⛩ KATA — L'Arte delle Forme

Gioco di strategia astratto per due giocatori, in stile arti marziali: ogni
carta è una **Forma** (uno schema di mosse) e vince chi cattura il Maestro
avversario (**Ippon**) o porta il proprio Maestro nel **Dojo** nemico.

PWA installabile su **iOS**, **Android** e **Desktop**: nessun server, nessuna
dipendenza, funziona offline. Le partite online sono peer-to-peer.

---

## 🎮 Caratteristiche

* **30 Forme originali** (10 di *Attacco*, 10 *Bilanciate*, 10 *Difensive*): il
  tipo dipende solo dalle mosse. Galleria completa dal menu **Il Mazzo**.
* **Tre scacchiere**: 5×5 (classica e rapida), 7×7 e 9×9 con mano da 2 o 3
  carte per giocatore, più la carta laterale.
* **Due flussi di carte**:
  * **Scambio** — la carta giocata va nello spazio laterale e prendi quella che
    c'era;
  * **Mazzo** — la carta giocata si scarta e ne peschi una nuova: schemi sempre
    diversi (rimescolamento deterministico, identico anche online).
* **Torneo** al meglio di 3, 5 o 7 partite, con punteggio della serie sempre
  visibile.
* **Tre avversari CPU davvero diversi**, calcolati su Web Worker (interfaccia
  sempre fluida):
  * *Discepolo* — gioca d'istinto e a volte sbaglia;
  * *Monaco* — ricerca a 2 semimosse, non regala mai il Maestro;
  * *Sensei* — iterative deepening alpha-beta con budget di tempo e
    valutazione ricca (mobilità, minacce, sicurezza del Maestro).
* **Online**: crea una stanza, condividi il codice a 6 caratteri (o il link
  `index.html?room=CODICE`) e gioca via WebRTC. Nessun account.
* **Grafica** rinnovata: pedine con elmo e cimiero per il Maestro, fascia per
  gli Allievi; carte con tipo, timbro colore e schema orientato per ciascun
  giocatore.
* **Audio naturale**: corde pizzicate sintetizzate (Karplus-Strong), flauto di
  bambù e vento di sottofondo, con riverbero; effetti "di legno" per le mosse.
* Pass & Play locale, annulla mossa, storico, statistiche per avversario e
  tornei, rito di estrazione delle carte, installazione guidata iOS/Android.

## 📁 Struttura

```
index.html        interfaccia, audio, PWA
js/engine.js      regole + IA (modulo condiviso: browser, worker, Node)
js/ai-worker.js   Web Worker che calcola le mosse della CPU
js/online.js      modulo online peer-to-peer (PeerJS/WebRTC)
server/           server di segnalazione opzionale (non necessario)
assets/           logo e icone
sw.js             service worker (cache offline)
```

## 🚀 Pubblicazione su GitHub Pages

1. Carica il contenuto su un repository pubblico GitHub.
2. In **Settings > Pages**, seleziona il branch `main` e la cartella `/ (root)`.
3. Salva: l'app è online e installabile. Il gioco online usa il cloud pubblico
   di PeerJS; per un server proprio vedi `server/README.md`.

## 🧪 Test rapido del motore

```bash
node -e "const E=require('./js/engine.js'); console.log(E.CARDS.length, 'carte');"
```
