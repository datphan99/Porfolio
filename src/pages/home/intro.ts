// Coordinates the loading-screen → hero handoff. The LoadingScreen mists out
// at 100%, drops an ink droplet onto the screen centre, and calls
// signalHeroReveal() on impact so the hero's splash + reveal ripple out from
// the centre — the two motions read as one continuous transition.
//
// Played-state persists in sessionStorage so an F5 in the same tab skips the
// intro entirely; a fresh tab/visit sees it once.
const PLAYED_KEY = "intro-played";

let revealed = (() => {
  try {
    return sessionStorage.getItem(PLAYED_KEY) === "1";
  } catch {
    return false;
  }
})();

const waiters: Array<() => void> = [];

export function signalHeroReveal(): void {
  if (revealed) return;
  revealed = true;
  try {
    sessionStorage.setItem(PLAYED_KEY, "1");
  } catch {
    // private mode / storage disabled — intro will replay next load, harmless
  }
  waiters.splice(0).forEach((cb) => cb());
}

/** True once the intro curtain has played this tab session — survives route
 *  swaps (module state) AND page reloads (sessionStorage), so F5 or returning
 *  from a case study skips straight to the revealed hero. */
export function introAlreadyPlayed(): boolean {
  return revealed;
}

export function onHeroReveal(cb: () => void): () => void {
  if (revealed) {
    cb();
    return () => {};
  }
  waiters.push(cb);
  return () => {
    const i = waiters.indexOf(cb);
    if (i >= 0) waiters.splice(i, 1);
  };
}
