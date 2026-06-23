"use client";

// Adaptado del patrón de toast de shadcn/ui.
import * as React from "react";
import type { ToastProps } from "@/components/ui/toast";

const TOAST_LIMIT = 4;
const TOAST_REMOVE_DELAY = 4000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
};

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type State = { toasts: ToasterToast[] };

const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };

const timeouts = new Map<string, ReturnType<typeof setTimeout>>();

function scheduleRemoval(id: string) {
  if (timeouts.has(id)) return;
  const t = setTimeout(() => {
    timeouts.delete(id);
    memoryState = {
      toasts: memoryState.toasts.filter((x) => x.id !== id),
    };
    listeners.forEach((l) => l(memoryState));
  }, TOAST_REMOVE_DELAY);
  timeouts.set(id, t);
}

function dispatchAdd(toast: ToasterToast) {
  memoryState = {
    toasts: [toast, ...memoryState.toasts].slice(0, TOAST_LIMIT),
  };
  listeners.forEach((l) => l(memoryState));
  scheduleRemoval(toast.id);
}

function dismiss(id: string) {
  memoryState = {
    toasts: memoryState.toasts.map((t) =>
      t.id === id ? { ...t, open: false } : t,
    ),
  };
  listeners.forEach((l) => l(memoryState));
}

type ToastInput = Omit<ToasterToast, "id">;

function toast(props: ToastInput) {
  const id = genId();
  dispatchAdd({
    ...props,
    id,
    open: true,
    onOpenChange: (open) => {
      if (!open) dismiss(id);
    },
  });
  return { id, dismiss: () => dismiss(id) };
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const i = listeners.indexOf(setState);
      if (i > -1) listeners.splice(i, 1);
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss,
  };
}

export { useToast, toast };
