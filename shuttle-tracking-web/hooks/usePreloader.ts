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

  const checkLoadingComplete = useCallback(() => {
    const totalRoutes = routesLength > 0 ? routesLength : 1;

    if (
      mapReadyRef.current &&
      loadedRoutesRef.current.size === totalRoutes &&
      totalRoutes > 0 &&
      namesLoadedRef.current
    ) {
      setTimeout(() => {
        setIsIntroFinished(true);
        setTimeout(() => {
          setShowPreloader(false);
        }, 800);
      }, 500);
    }
  }, [routesLength]);

  useEffect(() => {
    checkLoadingCompleteRef.current = checkLoadingComplete;
  }, [checkLoadingComplete]);

  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setIsIntroFinished(true);
      setTimeout(() => {
        setShowPreloader(false);
      }, 800);
    }, 5000);

    return () => clearTimeout(safetyTimer);
  }, []);

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