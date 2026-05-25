"use client";

import { useRouter } from "@/i18n/navigation";
import {
  isKeywordQueryValid,
  sanitizeSearchQuery,
} from "@/lib/search-query";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

function isMacPlatform(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform);
}

export function HeaderSearch() {
  const t = useTranslations("search");
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [focused, setFocused] = useState(false);
  const [shortcutLabel, setShortcutLabel] = useState("Ctrl+K");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setShortcutLabel(isMacPlatform() ? "⌘K" : "Ctrl+K");
  }, []);

  useEffect(() => {
    if (!pathname.includes("/search")) {
      setValue("");
    }
  }, [pathname]);

  useEffect(() => {
    if (!expanded) return;
    function handleClickOutside(event: MouseEvent) {
      if (overlayRef.current && overlayRef.current.contains(event.target as Node)) {
        return;
      }
      const target = event.target as HTMLElement;
      if (!target.closest(".header-search")) {
        setExpanded(false);
      }
    }
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;
    function handleDismiss(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setExpanded(false);
      }
    }
    document.addEventListener("keydown", handleDismiss);
    return () => document.removeEventListener("keydown", handleDismiss);
  }, [expanded]);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "search-overlay-open",
      expanded,
    );
    return () => {
      document.documentElement.classList.remove("search-overlay-open");
    };
  }, [expanded]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "k" && event.key !== "K") {
        return;
      }
      if (!event.metaKey && !event.ctrlKey) {
        return;
      }
      event.preventDefault();
      setExpanded(true);
      setFocused(true);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = sanitizeSearchQuery(value);
    if (!q) {
      router.push("/");
      setValue("");
      setExpanded(false);
      return;
    }
    if (!isKeywordQueryValid(q)) {
      return;
    }
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setExpanded(false);
  }

  const searchClass =
    focused || expanded ? "header-search is-expanded" : "header-search";

  const overlay = mounted && expanded ? createPortal(
    <div
      ref={overlayRef}
      className="header-search__overlay"
      aria-hidden="true"
      onClick={() => setExpanded(false)}
    />,
    document.body,
  ) : null;

  const mobileForm = mounted && expanded ? createPortal(
    <form
      className="header-search__form header-search__form--mobile is-open"
      role="search"
      onSubmit={handleSubmit}
    >
      <label className="visually-hidden" htmlFor="header-search-input-mobile">
        {t("headerPlaceholder")}
      </label>
      <span className="header-search__field">
        <input
          ref={inputRef}
          id="header-search-input-mobile"
          type="search"
          className="header-search__input"
          placeholder={t("headerPlaceholder")}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete="off"
          enterKeyHint="search"
        />
      </span>
      <button type="submit" className="header-search__submit">
        {t("submit")}
      </button>
    </form>,
    document.body,
  ) : null;

  return (
    <div className={searchClass}>
      <button
        type="button"
        className="header-search__toggle"
        aria-label={t("open")}
        aria-expanded={expanded}
        onClick={() => {
          setExpanded((v) => !v);
          if (!expanded) {
            requestAnimationFrame(() => inputRef.current?.focus());
          }
        }}
      >
        <SearchIcon />
      </button>
      <form
        className="header-search__form"
        role="search"
        onSubmit={handleSubmit}
      >
        <label className="visually-hidden" htmlFor="header-search-input">
          {t("headerPlaceholder")}
        </label>
        <span className="header-search__field">
          <input
            ref={inputRef}
            id="header-search-input"
            type="search"
            className="header-search__input"
            placeholder={t("headerPlaceholder")}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoComplete="off"
            enterKeyHint="search"
            aria-keyshortcuts={
              shortcutLabel.startsWith("⌘") ? "Meta+K" : "Control+K"
            }
          />
          <kbd className="header-search__kbd" aria-hidden="true">
            {shortcutLabel}
          </kbd>
        </span>
        <button type="submit" className="header-search__submit">
          {t("submit")}
        </button>
      </form>
      {overlay}
      {mobileForm}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle
        cx="11"
        cy="11"
        r="7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M16 16l5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}