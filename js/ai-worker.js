/* Web Worker dell'IA: calcola la mossa fuori dal thread UI così le
   animazioni (puntini "sta pensando", musica) restano fluide anche
   quando il Sensei usa tutto il suo budget di tempo. */
importScripts('./engine.js');

self.onmessage = function (e) {
  const { id, state, level } = e.data;
  let res = null, error = null;
  try {
    res = KataEngine.chooseAction(state, level);
  } catch (err) {
    error = String(err && err.message || err);
  }
  self.postMessage({ id, res, error });
};
