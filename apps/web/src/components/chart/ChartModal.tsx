"use client";

import { buildStarHistoryUrl } from "@github-trending/core";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

interface ChartModalProps {
  owner: string;
  name: string;
  open: boolean;
  onClose: () => void;
}

export function ChartModal({ owner, name, open, onClose }: ChartModalProps) {
  const t = useTranslations("chartModal");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const url = buildStarHistoryUrl([{ owner, name }]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    iframe.src = open ? url : "about:blank";
  }, [open, url]);

  return (
    <dialog
      ref={dialogRef}
      className="backdrop:bg-black/70 bg-surface border border-border rounded-[10px] p-0 max-w-3xl w-[95vw] text-text"
      onClose={onClose}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="font-mono text-sm">
          {owner}/{name}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-muted hover:text-text px-2 py-1"
        >
          {t("close")}
        </button>
      </div>
      <div className="relative aspect-[16/9] bg-bg">
        <iframe
          ref={iframeRef}
          title={`Star history ${owner}/${name}`}
          className="w-full h-full min-h-[280px] border-0"
          sandbox="allow-scripts allow-same-origin"
        />
        <p className="absolute bottom-2 left-3 text-xs text-muted">{t("note")}</p>
      </div>
      <div className="px-4 py-3 border-t border-border text-sm">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          {t("openExternal")}
        </a>
      </div>
    </dialog>
  );
}
