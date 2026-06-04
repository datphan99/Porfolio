import { createContext, useContext, type RefObject } from "react";

export interface HomeStage {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  capRef: RefObject<HTMLDivElement | null>;
  skyRef: RefObject<HTMLDivElement | null>;
  cursorRef: RefObject<HTMLDivElement | null>;
}

export const HomeStageContext = createContext<HomeStage | null>(null);

export function useHomeStage(): HomeStage {
  const ctx = useContext(HomeStageContext);
  if (!ctx) throw new Error("useHomeStage must be used within HomeStageContext.Provider");
  return ctx;
}
