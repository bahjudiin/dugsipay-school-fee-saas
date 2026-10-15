"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Copy, MessageCircle, MessagesSquare, Smartphone } from "lucide-react";
import { smsLink, waMeLink, waWebLink } from "@/lib/phone";
import { toast } from "@/components/Toast";
import { cn } from "@/components/ui";

function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * Universal "contact parent" menu: WhatsApp app, WhatsApp Web (works when
 * wa.me is blocked inside in-app browsers/iframes), native SMS, or copy text.
 * The dropdown is position:fixed so it is NEVER clipped by table scroll
 * containers — the reason links appeared "not working" in lists.
 * Every option only OPENS the relevant app pre-filled — nothing auto-sends.
 */
export default function ContactMenu({
  phone,
  message,
  label = "Open WhatsApp reminder",
  variant = "full",
}: {
  phone: string;
  message: string;
  label?: string;
  variant?: "full" | "icon";
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const mobile = isMobileDevice();

  function toggle() {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const menuH = 240;
      const menuW = 260;
      if (typeof window !== "undefined") {
        const openUp = r.bottom + menuH + 8 > window.innerHeight;
        setPos({
          top: openUp ? Math.max(8, r.top - menuH - 8) : r.bottom + 8,
          left: Math.max(8, Math.min(r.right - menuW, window.innerWidth - menuW - 8)),
        });
      } else {
        setPos({ top: 8, left: 8 });
      }
    }
    setOpen((v) => !v);
  }

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (
        btnRef.current?.contains(e.target as Node) ||
        menuRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onScroll() {
      setOpen(false);
    }
    if (typeof window !== "undefined") {
      document.addEventListener("mousedown", onDoc);
      document.addEventListener("keydown", onKey);
      window.addEventListener("scroll", onScroll, true);
    }
    return () => {
      if (typeof window !== "undefined") {
        document.removeEventListener("mousedown", onDoc);
        document.removeEventListener("keydown", onKey);
        window.removeEventListener("scroll", onScroll, true);
      }
    };
  }, [open]);

  async function copyText() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast({ title: "Message copied", description: "Paste it into any app to send." });
      setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 900);
    } catch {
      if (typeof window !== "undefined") {
        window.prompt("Copy the message:", message);
      }
    }
  }

  const item =
    "flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] font-medium text-slate-700 transition hover:bg-slate-100";

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="menu"
        title="Choose how to send — app, web, or SMS. You always press send yourself."
        className={
          variant === "icon"
            ? cn(
                "inline-flex items-center gap-1 rounded-full border border-aqua-200 px-2 py-1.5 text-aqua-700 transition hover:bg-aqua-50",
                open && "bg-aqua-50",
              )
            : "inline-flex items-center justify-center gap-2 rounded-full border border-aqua-200 bg-white px-4 py-2.5 text-sm font-semibold text-aqua-700 transition hover:bg-aqua-50"
        }
      >
        <MessageCircle className="size-4" />
        {variant === "full" && <span className="truncate">{label}</span>}
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          style={{ top: pos.top, left: pos.left }}
          className="fixed z-[90] w-[260px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_40px_-12px_rgba(0,0,0,0.25)]"
        >
          <p className="border-b border-slate-100 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Send — you confirm in the app
          </p>
          {mobile ? (
            <a role="menuitem" href={waMeLink(phone, message)} target="_top" rel="noopener" className={item} onClick={() => setOpen(false)}>
              <Smartphone className="size-4 shrink-0 text-aqua-600" />
              <span>
                WhatsApp app
                <span className="block text-[11px] font-normal text-slate-400">Best on this device</span>
              </span>
            </a>
          ) : (
            <a role="menuitem" href={waWebLink(phone, message)} target="_blank" rel="noopener noreferrer" className={item} onClick={() => setOpen(false)}>
              <MessageCircle className="size-4 shrink-0 text-aqua-600" />
              <span>
                WhatsApp Web
                <span className="block text-[11px] font-normal text-slate-400">Best on this device</span>
              </span>
            </a>
          )}
          {mobile ? (
            <a role="menuitem" href={waWebLink(phone, message)} target="_blank" rel="noopener noreferrer" className={item} onClick={() => setOpen(false)}>
              <MessageCircle className="size-4 shrink-0 text-aqua-600" />
              <span>
                WhatsApp Web (browser)
                <span className="block text-[11px] font-normal text-slate-400">Use if the app link is blocked</span>
              </span>
            </a>
          ) : (
            <a role="menuitem" href={waMeLink(phone, message)} target="_blank" rel="noopener noreferrer" className={item} onClick={() => setOpen(false)}>
              <Smartphone className="size-4 shrink-0 text-aqua-600" />
              <span>
                WhatsApp app
                <span className="block text-[11px] font-normal text-slate-400">Opens the installed app if available</span>
              </span>
            </a>
          )}
          <a role="menuitem" href={smsLink(phone, message)} className={item} onClick={() => setOpen(false)}>
            <MessagesSquare className="size-4 shrink-0 text-aqua-600" />
            <span>
              SMS (text message)
              <span className="block text-[11px] font-normal text-slate-400">Opens your messages app</span>
            </span>
          </a>
          <button role="menuitem" type="button" onClick={copyText} className={cn(item, "border-t border-slate-100")}>
            {copied ? <Check className="size-4 shrink-0 text-aqua-600" /> : <Copy className="size-4 shrink-0 text-slate-400" />}
            <span>{copied ? "Copied!" : "Copy message text"}</span>
          </button>
          <p className="border-t border-slate-100 bg-slate-50 px-3.5 py-2 text-[10px] leading-relaxed text-slate-400">
            Tip: the demo’s parent numbers are fictional — set a real number on a student to reach WhatsApp.
          </p>
        </div>
      )}
    </>
  );
}
