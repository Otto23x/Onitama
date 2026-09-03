/* =====================================================================
   KATA — Motore di gioco condiviso (regole + IA)
   ---------------------------------------------------------------------
   Modulo UMD senza dipendenze: viene usato dalla pagina (window.KataEngine),
   dal Web Worker dell'IA (importScripts) e da Node (test / server).
   Tutto lo stato è JSON puro, così può viaggiare via rete per il gioco
   online ed essere clonato per l'annulla mossa.
   ===================================================================== */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KataEngine = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ------------------------------------------------------------------
     1. IL MAZZO: 30 carte originali.
        Le mosse sono [dx, dy] dal punto di vista del giocatore che
        muove verso l'alto (dy > 0 = avanti). Ogni carta ha sempre
        almeno una mossa in avanti e nessuna mossa supera 2 caselle.
        Il "timbro" (blue/red) decide chi inizia la partita.
     ------------------------------------------------------------------ */
  const CARDS = [
    // --- Carte di Attacco (spingono complessivamente in avanti) ---
    { id: 'kaminari', name: 'KAMINARI', it: 'Fulmine',   stamp: 'blue', moves: [[0, 2], [0, -1]] },
    { id: 'suna',     name: 'SUNA',     it: 'Sabbia',    stamp: 'blue', moves: [[0, 1], [-2, 0], [2, 0]] },
    { id: 'yama',     name: 'YAMA',     it: 'Montagna',  stamp: 'red',  moves: [[-1, 1], [1, 1], [-1, 0], [1, 0]] },
    { id: 'honoo',    name: 'HONOO',    it: 'Fiamma',    stamp: 'red',  moves: [[-1, 1], [1, 1], [0, -1]] },
    { id: 'take',     name: 'TAKE',     it: 'Bambù',     stamp: 'red',  moves: [[0, 1], [-1, 0], [1, 0]] },
    { id: 'kemuri',   name: 'KEMURI',   it: 'Fumo',      stamp: 'red',  moves: [[1, 1], [1, -1], [-1, 0]] },
    { id: 'ya',       name: 'YA',       it: 'Freccia',   stamp: 'red',  moves: [[0, 2], [-1, 1], [1, 1]] },
    { id: 'rai',      name: 'RAI',      it: 'Tuono',     stamp: 'blue', moves: [[-1, 2], [1, 2], [0, -1]] },
    { id: 'taki',     name: 'TAKI',     it: 'Cascata',   stamp: 'red',  moves: [[0, 1], [0, 2], [0, -1]] },
    { id: 'sakura',   name: 'SAKURA',   it: 'Ciliegio',  stamp: 'blue', moves: [[-1, 1], [1, 1], [0, 1], [0, -2]] },

    // --- Carte Bilanciate (avanzata e ritirata si compensano) ---
    { id: 'arashi',   name: 'ARASHI',   it: 'Tempesta',  stamp: 'red',  moves: [[-2, 1], [2, 1], [-1, -1], [1, -1]] },
    { id: 'nami',     name: 'NAMI',     it: 'Onda',      stamp: 'red',  moves: [[-1, 1], [-2, 0], [1, -1]] },
    { id: 'shio',     name: 'SHIO',     it: 'Marea',     stamp: 'blue', moves: [[1, 1], [2, 0], [-1, -1]] },
    { id: 'kaze',     name: 'KAZE',     it: 'Vento',     stamp: 'blue', moves: [[-1, 1], [-1, 0], [1, 0], [1, -1]] },
    { id: 'kumo',     name: 'KUMO',     it: 'Nuvola',    stamp: 'red',  moves: [[1, 1], [1, 0], [-1, 0], [-1, -1]] },
    { id: 'hoshi',    name: 'HOSHI',    it: 'Stella',    stamp: 'blue', moves: [[-1, 1], [1, 1], [-1, -1], [1, -1]] },
    { id: 'tsuki',    name: 'TSUKI',    it: 'Luna',      stamp: 'red',  moves: [[0, 1], [-1, 0], [0, -1]] },
    { id: 'taiyo',    name: 'TAIYO',    it: 'Sole',      stamp: 'blue', moves: [[0, 1], [1, 0], [0, -1]] },
    { id: 'kiri',     name: 'KIRI',     it: 'Nebbia',    stamp: 'blue', moves: [[-1, 1], [-1, -1], [1, 0]] },
    { id: 'hikari',   name: 'HIKARI',   it: 'Luce',      stamp: 'red',  moves: [[0, 2], [-2, 0], [2, 0]] },

    // --- Carte Difensive (arretrano più di quanto avanzino) ---
    { id: 'hasu',     name: 'HASU',     it: 'Loto',      stamp: 'blue', moves: [[0, 1], [-1, -1], [1, -1]] },
    { id: 'tate',     name: 'TATE',     it: 'Scudo',     stamp: 'blue', moves: [[0, 1], [0, -2]] },
    { id: 'ne',       name: 'NE',       it: 'Radice',    stamp: 'red',  moves: [[0, 1], [-2, -1], [2, -1]] },
    { id: 'yuki',     name: 'YUKI',     it: 'Neve',      stamp: 'blue', moves: [[-1, 1], [1, -1], [0, -2]] },
    { id: 'koori',    name: 'KOORI',    it: 'Ghiaccio',  stamp: 'red',  moves: [[1, 1], [-1, -1], [0, -2]] },
    { id: 'kage',     name: 'KAGE',     it: 'Ombra',     stamp: 'blue', moves: [[-1, 0], [1, 0], [0, 1], [0, -2]] },
    { id: 'hibiki',   name: 'HIBIKI',   it: 'Eco',       stamp: 'red',  moves: [[0, 1], [-1, -2], [1, -2]] },
    { id: 'yuuhi',    name: 'YUUHI',    it: 'Tramonto',  stamp: 'red',  moves: [[-1, 1], [2, -1], [-1, -1]] },
    { id: 'akatsuki', name: 'AKATSUKI', it: 'Alba',      stamp: 'blue', moves: [[1, 1], [-2, -1], [1, -1]] },
    { id: 'tsuchi',   name: 'TSUCHI',   it: 'Terra',     stamp: 'blue', moves: [[0, 1], [-1, -1], [1, -1], [0, -1]] }
  ];

  const TYPES = {
    attack:   { key: 'attack',   it: 'Attacco',    short: 'ATT', color: '#ef4444', icon: '⚔' },
    balanced: { key: 'balanced', it: 'Bilanciata', short: 'BIL', color: '#f59e0b', icon: '☯' },
    defense:  { key: 'defense',  it: 'Difensiva',  short: 'DIF', color: '#38bdf8', icon: '🛡' }
  };

  // Il tipo deriva SOLO dalle mosse: somma degli spostamenti verticali.
  function classifyMoves(moves) {
    const push = moves.reduce((acc, m) => acc + m[1], 0);
    if (push > 0) return 'attack';
    if (push < 0) return 'defense';
    return 'balanced';
  }

  CARDS.forEach(c => {
    c.type = classifyMoves(c.moves);
    c.push = c.moves.reduce((acc, m) => acc + m[1], 0);
  });

  const CARD_BY_ID = {};
  CARDS.forEach(c => { CARD_BY_ID[c.id] = c; });
  function getCard(id) { return CARD_BY_ID[id]; }

  /* ------------------------------------------------------------------
     2. CONFIGURAZIONE PARTITA
     ------------------------------------------------------------------ */
  const BOARD_SIZES = [5, 7, 9];
  const MODES = ['swap', 'deck'];

  function maxHandSize(size) { return size >= 7 ? 3 : 2; }
  function defaultHandSize(size) { return size >= 7 ? 3 : 2; }
  function cardsNeeded(handSize) { return handSize * 2 + 1; }

  /* --- PRNG deterministico (mulberry32): il rimescolamento del mazzo in
         modalità "mazzo" deve essere identico su entrambi i client online. */
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function shuffleWithSeed(arr, seed) {
    const rnd = mulberry32(seed);
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }
  function randomSeed() { return Math.floor(Math.random() * 2147483647); }
  function shuffledDeckIds(seed) {
    return shuffleWithSeed(CARDS.map(c => c.id), seed == null ? randomSeed() : seed);
  }

  function emptyBoard(size) {
    return Array.from({ length: size }, () => Array(size).fill(null));
  }
  // Ogni giocatore: 1 Maestro (al centro) + size-1 Allievi sulla riga di casa.
  function setupBoard(size) {
    const b = emptyBoard(size);
    const mid = (size - 1) / 2;
    for (let x = 0; x < size; x++) {
      b[x][0] = { t: x === mid ? 'M' : 'S', o: 'p1' };
      b[x][size - 1] = { t: x === mid ? 'M' : 'S', o: 'p2' };
    }
    return b;
  }
  function other(p) { return p === 'p1' ? 'p2' : 'p1'; }
  // Il Dojo di un giocatore è la casella iniziale del suo Maestro.
  function dojoOf(size, player) { return { x: (size - 1) / 2, y: player === 'p1' ? 0 : size - 1 }; }
  function isDojo(size, player, x, y) { const d = dojoOf(size, player); return d.x === x && d.y === y; }

  /**
   * createGame({ size, handSize, mode, dealt, starter, seed })
   *  - dealt: array di id carta già mescolato (almeno 2*handSize+1 elementi).
   *  - starter: 'p1' | 'p2' (chi inizia; normalmente deciso dal timbro
   *             della carta chiave, vedi starterFromKeyCard).
   */
  function createGame(opts) {
    const size = BOARD_SIZES.includes(opts.size) ? opts.size : 5;
    const handSize = Math.min(Math.max(opts.handSize || defaultHandSize(size), 2), maxHandSize(size));
    const mode = MODES.includes(opts.mode) ? opts.mode : 'swap';
    const seed = opts.seed != null ? opts.seed : randomSeed();
    const dealt = (opts.dealt && opts.dealt.length >= cardsNeeded(handSize)) ? opts.dealt.slice() : shuffledDeckIds(seed);
    const p1 = dealt.slice(0, handSize);
    const p2 = dealt.slice(handSize, handSize * 2);
    const key = dealt[handSize * 2];
    const rest = dealt.slice(handSize * 2 + 1);
    return {
      size, handSize, mode, seed,
      board: setupBoard(size),
      hands: { p1, p2 },
      neutral: mode === 'swap' ? key : null,
      keyCard: key,
      deck: mode === 'deck' ? rest.concat([key]) : [],
      discard: [],
      turn: opts.starter === 'p2' ? 'p2' : 'p1',
      winner: null,
      winType: null,
      ply: 0,
      lastMove: null
    };
  }

  // Inizia chi possiede il colore stampato sulla carta chiave.
  function starterFromKeyCard(keyCardId, p1IsBlue) {
    const card = CARD_BY_ID[keyCardId];
    const keyIsBlue = card.stamp === 'blue';
    return keyIsBlue === p1IsBlue ? 'p1' : 'p2';
  }

  function cloneState(s) { return JSON.parse(JSON.stringify(s)); }

  /* ------------------------------------------------------------------
     3. REGOLE: mosse legali, applicazione, vittoria
     ------------------------------------------------------------------ */
  function genMoves(size, board, hand, player) {
    const res = [];
    const dir = player === 'p1' ? 1 : -1;
    for (let x = 0; x < size; x++) {
      const col = board[x];
      for (let y = 0; y < size; y++) {
        const piece = col[y];
        if (!piece || piece.o !== player) continue;
        for (let h = 0; h < hand.length; h++) {
          const card = CARD_BY_ID[hand[h]];
          if (!card) continue;
          const mv = card.moves;
          for (let k = 0; k < mv.length; k++) {
            const tx = x + mv[k][0] * dir;
            const ty = y + mv[k][1] * dir;
            if (tx < 0 || ty < 0 || tx >= size || ty >= size) continue;
            const target = board[tx][ty];
            if (target && target.o === player) continue;
            res.push({ from: { x, y }, to: { x: tx, y: ty }, cardId: card.id, piece: piece.t, capture: target ? target.t : null });
          }
        }
      }
    }
    return res;
  }

  function legalMoves(state, player) {
    const p = player || state.turn;
    if (state.winner) return [];
    return genMoves(state.size, state.board, state.hands[p], p);
  }

  function sameMove(a, b) {
    return a.from.x === b.from.x && a.from.y === b.from.y && a.to.x === b.to.x && a.to.y === b.to.y && a.cardId === b.cardId;
  }
  function findLegal(state, move) {
    return legalMoves(state).find(m => sameMove(m, move)) || null;
  }

  function drawFromDeck(state) {
    if (state.deck.length === 0) {
      if (state.discard.length === 0) return null;
      state.seed = (Math.imul(state.seed, 1103515245) + 12345) & 0x7fffffff;
      state.deck = shuffleWithSeed(state.discard, state.seed);
      state.discard = [];
    }
    return state.deck.shift();
  }

  // Gestisce la carta giocata: scambio con la neutra oppure scarto + pesca.
  function rotateCard(state, player, cardId) {
    const hand = state.hands[player];
    const idx = hand.indexOf(cardId);
    if (idx < 0) throw new Error('Carta non in mano: ' + cardId);
    if (state.mode === 'swap') {
      hand[idx] = state.neutral;
      state.neutral = cardId;
    } else {
      hand.splice(idx, 1);
      state.discard.push(cardId);
      const drawn = drawFromDeck(state);
      if (drawn) hand.push(drawn);
    }
  }

  function winFor(size, player, piece, target, to) {
    if (target && target.t === 'M') return 'ippon';
    if (piece.t === 'M' && isDojo(size, other(player), to.x, to.y)) return 'dojo';
    return null;
  }

  /** Applica una mossa e restituisce il NUOVO stato (quello passato non è toccato). */
  function applyMove(state, move) {
    const legal = findLegal(state, move);
    if (!legal) throw new Error('Mossa illegale');
    const s = cloneState(state);
    const player = s.turn;
    const piece = s.board[move.from.x][move.from.y];
    const target = s.board[move.to.x][move.to.y];
    s.board[move.to.x][move.to.y] = piece;
    s.board[move.from.x][move.from.y] = null;
    rotateCard(s, player, move.cardId);
    const win = winFor(s.size, player, piece, target, move.to);
    s.lastMove = { player, from: move.from, to: move.to, cardId: move.cardId, capture: target ? target.t : null, pass: false };
    s.ply++;
    if (win) { s.winner = player; s.winType = win; }
    else s.turn = other(player);
    return s;
  }

  /** Nessuna mossa legale: il giocatore cede comunque una carta e passa. */
  function applyPass(state, cardId) {
    if (state.winner) throw new Error('Partita finita');
    if (legalMoves(state).length > 0) throw new Error('Non puoi passare: hai mosse disponibili');
    const s = cloneState(state);
    const player = s.turn;
    rotateCard(s, player, cardId);
    s.lastMove = { player, cardId, pass: true };
    s.ply++;
    s.turn = other(player);
    return s;
  }

  function mustPass(state) { return !state.winner && legalMoves(state).length === 0; }

  /* ------------------------------------------------------------------
     4. INTELLIGENZA ARTIFICIALE
        Tre livelli davvero diversi:
        - easy   (Discepolo): gioca quasi a caso, prende le vittorie
                  immediate ma spesso non si accorge delle minacce.
        - medium (Monaco): ricerca a 2 semimosse, valutazione semplice,
                  non regala mai il Maestro con una svista da 1 turno.
        - hard   (Sensei): iterative deepening con alpha-beta e budget di
                  tempo, valutazione ricca (mobilità, minacce, sicurezza
                  del Maestro, avanzata), ordinamento mosse.
     ------------------------------------------------------------------ */
  const WIN_SCORE = 100000;

  const LEVELS = {
    easy:   { key: 'easy',   it: 'Discepolo', sub: 'Facile',    depth: 1, timeMs: 200,  rich: false },
    medium: { key: 'medium', it: 'Monaco',    sub: 'Medio',     depth: 2, timeMs: 900,  rich: false },
    hard:   { key: 'hard',   it: 'Sensei',    sub: 'Difficile', depth: 8, timeMs: 1600, rich: true }
  };

  function simMove(size, board, hands, neutral, mode, player, mv) {
    const nb = board.map(c => c.slice());
    const piece = nb[mv.from.x][mv.from.y];
    const target = nb[mv.to.x][mv.to.y];
    nb[mv.to.x][mv.to.y] = piece;
    nb[mv.from.x][mv.from.y] = null;
    const hand = hands[player].slice();
    const idx = hand.indexOf(mv.cardId);
    let nn = neutral;
    if (mode === 'swap') { hand[idx] = neutral; nn = mv.cardId; }
    else hand.splice(idx, 1); // la carta pescata è ignota: la mano si accorcia
    const nh = player === 'p1' ? { p1: hand, p2: hands.p2 } : { p1: hands.p1, p2: hand };
    return { board: nb, hands: nh, neutral: nn, win: winFor(size, player, piece, target, mv.to) };
  }

  function simPass(hands, neutral, mode, player) {
    const hand = hands[player].slice();
    let nn = neutral;
    if (mode === 'swap' && hand.length > 0) { const c = hand[0]; hand[0] = neutral; nn = c; }
    else if (hand.length > 0) hand.shift();
    const nh = player === 'p1' ? { p1: hand, p2: hands.p2 } : { p1: hands.p1, p2: hand };
    return { hands: nh, neutral: nn };
  }

  function masterOf(size, board, player) {
    for (let x = 0; x < size; x++) for (let y = 0; y < size; y++) {
      const p = board[x][y];
      if (p && p.t === 'M' && p.o === player) return { x, y };
    }
    return null;
  }

  // Punteggio positivo = favorevole a `persp`.
  function evaluate(size, board, hands, neutral, mode, persp, rich, toMove) {
    const mid = (size - 1) / 2;
    const maxCenter = mid * 2;
    let score = 0;
    let myPieces = 0, opPieces = 0;
    for (let x = 0; x < size; x++) {
      const col = board[x];
      for (let y = 0; y < size; y++) {
        const p = col[y];
        if (!p) continue;
        const mine = p.o === persp;
        const forward = p.o === 'p1' ? y : (size - 1 - y);
        let v;
        if (p.t === 'M') {
          const enemyDojo = dojoOf(size, other(p.o));
          const dist = Math.abs(x - enemyDojo.x) + Math.abs(y - enemyDojo.y);
          v = (size * 2 - dist) * 4;            // il Maestro che avanza vale di più
        } else {
          v = 100 + forward * 3;                // gli Allievi valgono per materiale e avanzata
        }
        v += (maxCenter - (Math.abs(x - mid) + Math.abs(y - mid))) * 2;
        if (mine) { score += v; myPieces++; } else { score -= v; opPieces++; }
      }
    }
    if (!rich) return score;

    // Valutazione ricca: mobilità, minacce e sicurezza del Maestro.
    const myMoves = genMoves(size, board, hands[persp], persp);
    const opMoves = genMoves(size, board, hands[other(persp)], other(persp));
    score += (myMoves.length - opMoves.length) * 3;

    let myThreat = 0, opThreat = 0, masterDanger = false, masterChance = false;
    for (let i = 0; i < myMoves.length; i++) {
      const c = myMoves[i].capture;
      if (c === 'S') myThreat += 12; else if (c === 'M') masterChance = true;
    }
    for (let i = 0; i < opMoves.length; i++) {
      const c = opMoves[i].capture;
      if (c === 'S') opThreat += 12; else if (c === 'M') masterDanger = true;
    }
    score += myThreat - opThreat;
    if (masterDanger) score -= (toMove === persp) ? 150 : 600;
    if (masterChance) score += (toMove === persp) ? 600 : 150;

    // Qualità della mano: le carte d'attacco valgono più in avanzata.
    const handValue = h => h.reduce((a, id) => a + (CARD_BY_ID[id] ? CARD_BY_ID[id].moves.length * 2 + CARD_BY_ID[id].push : 0), 0);
    score += handValue(hands[persp]) - handValue(hands[other(persp)]);
    return score;
  }

  function orderMoves(moves) {
    // Vittorie e catture prima: migliora enormemente il taglio alpha-beta.
    for (let i = 0; i < moves.length; i++) {
      const m = moves[i];
      m._o = (m.capture === 'M' ? 1000 : m.capture === 'S' ? 100 : 0) + (m.piece === 'M' ? 1 : 0);
    }
    moves.sort((a, b) => b._o - a._o);
    return moves;
  }

  function search(ctx, board, hands, neutral, depth, player, alpha, beta) {
    ctx.nodes++;
    if ((ctx.nodes & 511) === 0 && Date.now() > ctx.deadline) ctx.aborted = true;
    if (ctx.aborted) return 0;
    if (depth === 0) return evaluate(ctx.size, board, hands, neutral, ctx.mode, ctx.persp, ctx.rich, player);

    const moves = genMoves(ctx.size, board, hands[player], player);
    if (moves.length === 0) {
      const sp = simPass(hands, neutral, ctx.mode, player);
      return search(ctx, board, sp.hands, sp.neutral, depth - 1, other(player), alpha, beta);
    }
    orderMoves(moves);
    const maximizing = player === ctx.persp;
    let best = maximizing ? -Infinity : Infinity;
    for (let i = 0; i < moves.length; i++) {
      const mv = moves[i];
      const sim = simMove(ctx.size, board, hands, neutral, ctx.mode, player, mv);
      let v;
      if (sim.win) v = maximizing ? (WIN_SCORE + depth) : -(WIN_SCORE + depth);
      else v = search(ctx, sim.board, sim.hands, sim.neutral, depth - 1, other(player), alpha, beta);
      if (ctx.aborted) return 0;
      if (maximizing) { if (v > best) best = v; if (v > alpha) alpha = v; }
      else { if (v < best) best = v; if (v < beta) beta = v; }
      if (beta <= alpha) break;
    }
    return best;
  }

  function scoreRootMoves(state, moves, depth, timeMs, rich, persp) {
    const ctx = { size: state.size, mode: state.mode, persp, rich, deadline: Date.now() + timeMs, nodes: 0, aborted: false };
    const scored = [];
    let alpha = -Infinity;
    for (let i = 0; i < moves.length; i++) {
      const mv = moves[i];
      const sim = simMove(state.size, state.board, state.hands, state.neutral, state.mode, persp, mv);
      let v;
      if (sim.win) v = WIN_SCORE + depth;
      else v = search(ctx, sim.board, sim.hands, sim.neutral, depth - 1, other(persp), alpha, Infinity);
      if (ctx.aborted) return null;
      // Con la finestra alpha-beta una mossa peggiore può restituire esattamente
      // alpha: solo i punteggi che alzano alpha (o la prima mossa) sono "esatti".
      scored.push({ move: mv, score: v, exact: i === 0 || v > alpha });
      if (v > alpha) alpha = v;
    }
    return { scored, nodes: ctx.nodes };
  }

  function bestByIterativeDeepening(state, level, rnd) {
    const persp = state.turn;
    let moves = orderMoves(legalMoves(state));
    const start = Date.now();
    let best = null, lastDepth = 0, nodes = 0;
    for (let depth = 1; depth <= level.depth; depth++) {
      const elapsed = Date.now() - start;
      const remaining = level.timeMs - elapsed;
      if (depth > 1 && remaining < level.timeMs * 0.15) break;
      const res = scoreRootMoves(state, moves, depth, remaining, level.rich, persp);
      if (!res) break;
      nodes += res.nodes;
      res.scored.sort((a, b) => (b.score - a.score) || ((b.exact ? 1 : 0) - (a.exact ? 1 : 0)));
      best = res.scored;
      lastDepth = depth;
      // Riordina per la prossima iterazione: le migliori per prime.
      moves = res.scored.map(s => s.move);
      if (best[0].score >= WIN_SCORE) break;   // vittoria forzata trovata
      if (best[0].score <= -WIN_SCORE + 20 && best.every(s => s.score <= -WIN_SCORE + 20)) break; // tutto perso
    }
    if (!best) return { move: moves[0], depth: 0, nodes };
    // Tra mosse di pari valore scegli a caso (varietà), tolleranza minima.
    const top = best[0].score;
    const tie = best.filter(s => s.exact && s.score >= top - (level.rich ? 0 : 8));
    const pick = tie[Math.floor(rnd() * tie.length)];
    return { move: pick.move, depth: lastDepth, nodes, score: pick.score };
  }

  function leavesMasterExposed(state, mv) {
    const sim = simMove(state.size, state.board, state.hands, state.neutral, state.mode, state.turn, mv);
    if (sim.win) return false;
    const replies = genMoves(state.size, sim.board, sim.hands[other(state.turn)], other(state.turn));
    return replies.some(r => r.capture === 'M');
  }

  function chooseEasy(state, moves, rnd) {
    const win = moves.find(m => m.capture === 'M') ||
      moves.find(m => m.piece === 'M' && isDojo(state.size, other(state.turn), m.to.x, m.to.y));
    if (win) return { move: win, depth: 1 };
    // 45%: mossa totalmente casuale (può regalare il Maestro).
    if (rnd() < 0.45) return { move: moves[Math.floor(rnd() * moves.length)], depth: 0 };
    // Altrimenti: cattura se possibile, ma senza esporre il Maestro.
    const safe = moves.filter(m => !leavesMasterExposed(state, m));
    const pool = safe.length ? safe : moves;
    const caps = pool.filter(m => m.capture);
    if (caps.length && rnd() < 0.7) return { move: caps[Math.floor(rnd() * caps.length)], depth: 1 };
    return { move: pool[Math.floor(rnd() * pool.length)], depth: 1 };
  }

  /**
   * chooseAction(state, levelKey, opts) →
   *   { move } oppure { pass: cardId } (nessuna mossa legale)
   */
  function chooseAction(state, levelKey, opts) {
    const level = LEVELS[levelKey] || LEVELS.medium;
    const rnd = (opts && opts.rnd) || Math.random;
    if (state.winner) return null;
    const moves = legalMoves(state);
    if (moves.length === 0) {
      // Passa cedendo la carta meno utile (meno mosse).
      const hand = state.hands[state.turn].slice().sort((a, b) => CARD_BY_ID[a].moves.length - CARD_BY_ID[b].moves.length);
      return { pass: hand[0], depth: 0 };
    }
    const started = Date.now();
    let res;
    if (level.key === 'easy') res = chooseEasy(state, moves, rnd);
    else res = bestByIterativeDeepening(state, level, rnd);
    res.ms = Date.now() - started;
    res.level = level.key;
    return res;
  }

  /* ------------------------------------------------------------------
     5. UTILITÀ VARIE
     ------------------------------------------------------------------ */
  function coordLabel(size, x, y) {
    return String.fromCharCode(97 + x) + (y + 1);
  }

  return {
    VERSION: '1.0.0',
    CARDS, TYPES, CARD_BY_ID, getCard, classifyMoves,
    BOARD_SIZES, MODES, LEVELS, maxHandSize, defaultHandSize, cardsNeeded,
    shuffledDeckIds, shuffleWithSeed, randomSeed,
    createGame, starterFromKeyCard, cloneState, setupBoard, dojoOf, isDojo, other,
    legalMoves, findLegal, applyMove, applyPass, mustPass,
    chooseAction, evaluate, coordLabel
  };
}));
