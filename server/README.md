# Server di segnalazione (opzionale)

Le partite online di **Kata** sono peer-to-peer (WebRTC): i due dispositivi si
parlano direttamente. Serve solo un server di *segnalazione* per farli
incontrare tramite il codice stanza. Per default l'app usa il cloud pubblico di
PeerJS, quindi **non è obbligatorio ospitare nulla**.

Se vuoi un server tuo:

```bash
cd server
npm install
PORT=9000 npm start          # in ascolto su http://localhost:9000/kata
```

Pubblicalo dietro HTTPS (Render, Fly.io, un VPS con Nginx…) e nell'app, dalla
console del browser, imposta:

```js
localStorage.setItem('kata_peer_server', JSON.stringify({
  host: 'kata-signal.tuodominio.it', port: 443, path: '/kata', secure: true
}));
```

Variabili d'ambiente: `PORT`, `PEER_PATH` (default `/kata`), `PROXIED=1` se
dietro un reverse proxy, `CORS_ORIGIN` per limitare l'origine.
