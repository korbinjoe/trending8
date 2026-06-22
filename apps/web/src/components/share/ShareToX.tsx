"use client";

import { buildShareUrl } from "@/lib/share-text";
import { useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";

function XIcon() {
  return (
    <svg className="btn-icon__svg" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    </svg>
  );
}

async function capturePageToClipboard(listSelector: string, count: number): Promise<boolean> {
  try {
    const { toBlob } = await import("html-to-image");

    const root = document.querySelector(".site-header-sticky")
      ?.parentElement as HTMLElement | null;
    if (!root) return false;

    const list = root.querySelector(listSelector) as HTMLElement | null;
    const listItems = list
      ? (Array.from(list.children) as HTMLElement[])
      : [];
    const overflow = listItems.slice(count);
    const loadMore = root.querySelector(".feed-load-more") as HTMLElement | null;
    const footer = root.querySelector("footer") as HTMLElement | null;

    const header = root.querySelector(".site-header-sticky") as HTMLElement | null;
    const savedScroll = window.scrollY;
    const restores: (() => void)[] = [];

    for (const el of overflow) {
      el.style.display = "none";
      restores.push(() => { el.style.display = ""; });
    }
    if (loadMore) {
      loadMore.style.display = "none";
      restores.push(() => { loadMore.style.display = ""; });
    }
    if (footer) {
      footer.style.display = "none";
      restores.push(() => { footer.style.display = ""; });
    }
    if (header) {
      header.style.position = "relative";
      restores.push(() => { header.style.position = ""; });
    }
    window.scrollTo(0, 0);
    restores.push(() => { window.scrollTo(0, savedScroll); });

    try {
      const blob = await toBlob(root, {
        backgroundColor: "#0c0e12",
        pixelRatio: 2,
      });
      if (!blob) return false;
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      return true;
    } finally {
      for (const fn of restores) fn();
    }
  } catch {
    return false;
  }
}

interface ShareToXProps {
  text: string;
  url: string;
  variant?: "icon" | "button";
  label?: string;
  captureSelector?: string;
  captureCount?: number;
  /**
   * 方案 A:主推不放外链以最大化 X 推荐 reach。
   * 打开预填文案(无 URL)的推文弹窗,并显示一个带"复制链接"按钮的
   * 持久提示,引导用户发完主推后用回复带上链接。
   */
  linkInReply?: boolean;
}

export function ShareToX({
  text,
  url,
  variant = "icon",
  label: customLabel,
  captureSelector,
  captureCount = 8,
  linkInReply = false,
}: ShareToXProps) {
  const t = useTranslations("cta");
  const label = customLabel ?? t("shareX");
  const [toast, setToast] = useState(false);
  const [linkToast, setLinkToast] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = useCallback(() => {
    setToast(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(false), 4000);
  }, []);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      /* clipboard unavailable — ignore */
    }
  }, [url]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (captureSelector) {
      const copied = await capturePageToClipboard(captureSelector, captureCount);
      if (copied && !linkInReply) showToast();
    }

    if (linkInReply) {
      setLinkToast(true);
      window.open(buildShareUrl(text, ""), "_blank", "noopener,noreferrer,width=550,height=420");
    } else {
      window.open(buildShareUrl(text, url), "_blank", "noopener,noreferrer,width=550,height=420");
    }
  };

  const toastEl = toast && (
    <span className="share-toast" role="status">
      {t("imageCopied")}
    </span>
  );

  const linkToastEl = linkToast && (
    <span className="share-toast share-toast--link" role="status">
      <span className="share-toast__hint">{t("linkReplyHint")}</span>
      <button
        type="button"
        className="share-toast__btn"
        onClick={(e) => {
          e.stopPropagation();
          void handleCopyLink();
        }}
      >
        {linkCopied ? t("linkCopied") : t("copyLink")}
      </button>
      <button
        type="button"
        className="share-toast__close"
        aria-label={t("close")}
        onClick={(e) => {
          e.stopPropagation();
          setLinkToast(false);
        }}
      >
        ×
      </button>
    </span>
  );

  if (variant === "button") {
    return (
      <span style={{ position: "relative", display: "inline-flex" }}>
        <button type="button" className="btn btn--x" onClick={handleClick}>
          <XIcon /> {label}
        </button>
        {toastEl}
        {linkToastEl}
      </span>
    );
  }

  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
      <button
        type="button"
        className="btn-icon btn-icon--x"
        aria-label={label}
        title={label}
        onClick={handleClick}
      >
        <XIcon />
      </button>
      {toastEl}
      {linkToastEl}
    </span>
  );
}
