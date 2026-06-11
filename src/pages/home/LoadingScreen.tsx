import { useRef } from "react";
import { profile } from "../../data/portfolio";
import { introAlreadyPlayed } from "./intro";
import { useIntroSequence } from "./useIntroSequence";

export default function LoadingScreen() {
  // Returning to home mid-session (e.g. back from a case study, under the
  // mist transition) skips the intro — it only plays on the first visit.
  return introAlreadyPlayed() ? null : <LoadingScreenInner />;
}

function LoadingScreenInner() {
  const rootRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useIntroSequence({ rootRef, numRef, barRef });

  return (
    <div ref={rootRef} className="intro" aria-hidden="true">
      {/* Ink droplet — falls from above to the screen centre after the loader
          mists out; its impact triggers the hero's splash reveal. */}
      <span className="intro-drop" />

      <div className="intro-meta">
        <span className="intro-name" data-intro-fade>
          {profile.name}
        </span>
        <span className="intro-count" data-intro-fade>
          <span ref={numRef}>0</span>
          <i>%</i>
        </span>
      </div>

      <div className="intro-line" data-intro-fade>
        <span ref={barRef} />
      </div>
    </div>
  );
}
