/* =====================================================================
   KATA — Server di segnalazione opzionale per il gioco online
   ---------------------------------------------------------------------
   L'app usa di default il cloud pubblico di PeerJS (nessun server da
   gestire). Se preferisci un server tuo (più affidabile, sotto il tuo
   dominio) avvia questo script su un host Node (Render, Fly.io, VPS…):

     cd server && npm install && npm start

   Poi, nell'app, salva in localStorage la configurazione:
     localStorage.setItem('kata_peer_server',
       JSON.stringify({ host: 'tuo-dominio.it', port: 443, path: '/kata', secure: true }));

   Il server non conosce le regole del gioco: fa solo incontrare i due
   client, che poi si parlano direttamente via WebRTC.
   ===================================================================== */
const { PeerServer } = require('peer');

const port = Number(process.env.PORT || 9000);
const path = process.env.PEER_PATH || '/kata';

const server = PeerServer({
  port,
  path,
  allow_discovery: false,
  proxied: process.env.PROXIED === '1',   // dietro un reverse proxy (Render/Fly/Nginx)
  corsOptions: { origin: process.env.CORS_ORIGIN || '*' }
});

server.on('connection', (client) => console.log('[kata] peer collegato:', client.getId()));
server.on('disconnect', (client) => console.log('[kata] peer scollegato:', client.getId()));
console.log(`[kata] server di segnalazione in ascolto su :${port}${path}`);
