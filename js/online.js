/* =====================================================================
   KATA — Modulo online (peer-to-peer con PeerJS / WebRTC)
   ---------------------------------------------------------------------
   Non serve un server di gioco: i due client si collegano direttamente
   tramite un canale dati WebRTC. Il server di segnalazione è per default
   il cloud pubblico di PeerJS; per usarne uno proprio (vedi server/) basta
   salvare in localStorage la chiave "kata_peer_server" con un JSON
   { host, port, path, secure }.
   ===================================================================== */
const KataOnline = (function () {
  'use strict';

  const LIB_URLS = [
    'https://cdn.jsdelivr.net/npm/peerjs@1.5.5/dist/peerjs.min.js',
    'https://unpkg.com/peerjs@1.5.5/dist/peerjs.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/peerjs/1.5.5/peerjs.min.js'
  ];
  const PREFIX = 'kata-dojo-';
  const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // senza caratteri ambigui
  const ICE = { iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ] };

  let peer = null;
  let conn = null;
  let listener = null;
  let role = null;
  let code = null;
  let libPromise = null;

  function emit(type, payload) {
    if (listener) {
      try { listener(type, payload); } catch (e) { console.error(e); }
    }
  }

  function loadLib() {
    if (typeof window.Peer === 'function') return Promise.resolve();
    if (libPromise) return libPromise;
    libPromise = new Promise((resolve, reject) => {
      let i = 0;
      const tryNext = () => {
        if (i >= LIB_URLS.length) { libPromise = null; reject(new Error('Impossibile caricare la libreria online. Controlla la connessione.')); return; }
        const s = document.createElement('script');
        s.src = LIB_URLS[i++];
        s.async = true;
        s.onload = () => (typeof window.Peer === 'function' ? resolve() : tryNext());
        s.onerror = () => { s.remove(); tryNext(); };
        document.head.appendChild(s);
      };
      tryNext();
    });
    return libPromise;
  }

  function peerOptions() {
    const opts = { debug: 0, config: ICE };
    try {
      const custom = JSON.parse(localStorage.getItem('kata_peer_server') || 'null');
      if (custom && custom.host) {
        opts.host = custom.host;
        if (custom.port) opts.port = Number(custom.port);
        if (custom.path) opts.path = custom.path;
        if (custom.secure != null) opts.secure = !!custom.secure;
        if (custom.key) opts.key = custom.key;
      }
    } catch (e) { /* ignora config non valida */ }
    return opts;
  }

  function makeCode() {
    let c = '';
    const rnd = new Uint32Array(6);
    if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(rnd);
    else for (let i = 0; i < 6; i++) rnd[i] = Math.floor(Math.random() * 4294967296);
    for (let i = 0; i < 6; i++) c += ALPHABET[rnd[i] % ALPHABET.length];
    return c;
  }

  function normalizeCode(raw) {
    return String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/O/g, '0').replace(/I/g, '1').slice(0, 6);
  }

  function errorMessage(err) {
    const type = err && err.type;
    switch (type) {
      case 'peer-unavailable': return 'Stanza non trovata: controlla il codice.';
      case 'unavailable-id': return 'Codice già in uso, riprovo…';
      case 'network': return 'Rete non raggiungibile: verifica la connessione.';
      case 'browser-incompatible': return 'Questo browser non supporta il gioco online.';
      case 'server-error': return 'Server di collegamento non disponibile, riprova tra poco.';
      default: return (err && err.message) ? err.message : 'Errore di connessione.';
    }
  }

  function wire(c) {
    conn = c;
    c.on('open', () => emit('connected', { role }));
    c.on('data', (d) => { if (d && typeof d === 'object') emit('message', d); });
    c.on('close', () => { if (conn === c) { conn = null; emit('disconnected'); } });
    c.on('error', (e) => emit('error', errorMessage(e)));
  }

  function destroyPeer() {
    if (conn) { try { conn.close(); } catch (e) {} conn = null; }
    if (peer) { try { peer.destroy(); } catch (e) {} peer = null; }
  }

  /** Crea una stanza e restituisce il codice tramite l'evento 'ready'. */
  async function host(onEvent) {
    close();
    listener = onEvent;
    role = 'host';
    await loadLib();
    let attempts = 0;
    const open = () => {
      code = makeCode();
      peer = new window.Peer(PREFIX + code, peerOptions());
      peer.on('open', () => emit('ready', { code }));
      peer.on('connection', (c) => {
        if (conn && conn.open) { try { c.close(); } catch (e) {} return; } // stanza piena
        wire(c);
      });
      peer.on('disconnected', () => { if (peer && !peer.destroyed) { try { peer.reconnect(); } catch (e) {} } });
      peer.on('error', (e) => {
        if (e && e.type === 'unavailable-id' && attempts++ < 3) { destroyPeer(); open(); return; }
        emit('error', errorMessage(e));
      });
    };
    open();
    return code;
  }

  /** Entra in una stanza esistente. */
  async function join(rawCode, onEvent) {
    close();
    listener = onEvent;
    role = 'guest';
    code = normalizeCode(rawCode);
    if (code.length !== 6) throw new Error('Il codice stanza è di 6 caratteri.');
    await loadLib();
    peer = new window.Peer(undefined, peerOptions());
    peer.on('open', () => {
      const c = peer.connect(PREFIX + code, { reliable: true, serialization: 'json' });
      wire(c);
    });
    peer.on('error', (e) => emit('error', errorMessage(e)));
    return code;
  }

  function send(msg) {
    if (conn && conn.open) { conn.send(msg); return true; }
    return false;
  }

  function isConnected() { return !!(conn && conn.open); }

  function close() {
    destroyPeer();
    listener = null;
    role = null;
    code = null;
  }

  return { host, join, send, close, isConnected, normalizeCode, get role() { return role; }, get code() { return code; } };
})();
