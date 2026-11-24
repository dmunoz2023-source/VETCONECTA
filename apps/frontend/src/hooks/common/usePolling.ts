import { useEffect, useEffectEvent } from "react";

/**
 * Ejecuta `task` al montar, cada `intervalMs` y cuando la pestaña vuelve a estar visible.
 * `task` siempre usa la última versión entregada, sin reiniciar el intervalo.
 */
export function usePolling(task: () => void | Promise<void>, intervalMs: number) {
  const runTask = useEffectEvent(() => {
    void task();
  });

  useEffect(() => {
    const runIfVisible = () => {
      if (document.visibilityState === "visible") runTask();
    };

    runTask();
    const intervalId = setInterval(runTask, intervalMs);
    window.addEventListener("focus", runIfVisible);
    document.addEventListener("visibilitychange", runIfVisible);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", runIfVisible);
      document.removeEventListener("visibilitychange", runIfVisible);
    };
  }, [intervalMs]);
}
