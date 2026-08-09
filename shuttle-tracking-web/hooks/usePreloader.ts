"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface PreloaderOptions {
  routesLength: number;
}

export function usePreloader({ routesLength }: PreloaderOptions) {
  const [showPreloader, setShowPreloader] = useState<boolean>(true);
  const [isIntroFinished, setIsIntroFinished] = useState<boolean>(false);

  const namesLoadedRef = useRef<boolean>(false);
  const loadedRoutesRef = useRef<Set<string>>(new Set());
  const mapReadyRef = useRef<boolean>(false);
  const checkLoadingCompleteRef = useRef<() => void>(() => {});
  const completionStartedRef = useRef(false);
  const introTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const beginCompletion = useCallback((introDelayMs: number) => {
    if (completionStartedRef.current) return;
    completionStartedRef.current = true;
    introTimerRef.current = setTimeout(() => {
      setIsIntroFinished(true);
      hideTimerRef.current = setTimeout(() => setShowPreloader(false), 800);
    }, introDelayMs);
  }, []);

  const checkLoadingComplete = useCallback(() => {
    const requiredRouteCount = 1;

    if (
      mapReadyRef.current &&
      loadedRoutesRef.current.size >= requiredRouteCount &&
      routesLength > 0 &&
      namesLoadedRef.current
    ) {
      beginCompletion(500);
    }
  }, [beginCompletion, routesLength]);

  useEffect(() => {
    checkLoadingCompleteRef.current = checkLoadingComplete;
  }, [checkLoadingComplete]);

  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      beginCompletion(0);
    }, 5000);

    return () => {
      clearTimeout(safetyTimer);
      if (introTimerRef.current) clearTimeout(introTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [beginCompletion]);

  return useMemo(
    () => ({
      showPreloader,
      isIntroFinished,
      namesLoadedRef,
      loadedRoutesRef,
      mapReadyRef,
      checkLoadingCompleteRef,
      checkLoadingComplete,
    }),
    [showPreloader, isIntroFinished, checkLoadingComplete]
  );
}
