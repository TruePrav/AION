"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmOptions {
  title?: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
}

interface ConfirmState extends ConfirmOptions {
  open: boolean;
  resolve?: (value: boolean) => void;
}

const ConfirmContext = createContext<((opts: ConfirmOptions) => Promise<boolean>) | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfirmState>({ open: false });

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ open: true, ...opts, resolve });
    });
  }, []);

  const handleClose = (result: boolean) => {
    state.resolve?.(result);
    setState((s) => ({ ...s, open: false }));
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog open={state.open} onOpenChange={(open) => !open && handleClose(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{state.title || "Are you sure?"}</DialogTitle>
            {state.description && <DialogDescription>{state.description}</DialogDescription>}
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleClose(false)}>
              {state.cancelLabel || "Cancel"}
            </Button>
            <Button
              variant={state.variant === "destructive" ? "destructive" : "default"}
              onClick={() => handleClose(true)}
            >
              {state.confirmLabel || "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within <ConfirmProvider>");
  return ctx;
}
