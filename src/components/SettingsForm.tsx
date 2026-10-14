"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { updateSettings } from "@/lib/actions/settings-actions";
import type { FormState } from "@/lib/actions/types";
import { toast } from "@/components/Toast";
import type { Settings } from "@/db/schema";
import { Alert, Field, btnPrimary, btnSecondary, cn, inputCls, inputErrorCls } from "@/components/ui";
import { CURRENCIES } from "@/lib/format";
import { LANGUAGES } from "@/lib/i18n";

export default function SettingsForm({ settings }: { settings: Settings }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(updateSettings, {});
  const [logoPreview, setLogoPreview] = useState<string | null>(settings.logoData);
  const [logoData, setLogoData] = useState("");
  const [removeLogo, setRemoveLogo] = useState(false);
  const [currencySel, setCurrencySel] = useState(
    CURRENCIES.some((c) => c.code === settings.currency) ? settings.currency : "CUSTOM",
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      toast({ title: "Settings saved", description: "The whole app now uses them." });
      router.refresh();
    } else if (state.error) {
      toast({ type: "error", title: "Couldn't save settings", description: state.error });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function onPickLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 300_000) {
      alert("Logo image is too large — please use an image under 300 KB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? "");
      setLogoData(dataUrl);
      setLogoPreview(dataUrl);
      setRemoveLogo(false);
    };
    reader.readAsDataURL(file);
  }

  return (
    <form action={formAction} className="space-y-8">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.ok && <Alert tone="success">Settings saved — the whole app now uses them.</Alert>}

      {/* School profile */}
      <section>
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">School profile</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="School name" required error={state.fieldErrors?.schoolName}>
            <input
              name="schoolName"
              defaultValue={settings.schoolName}
              className={cn(inputCls, state.fieldErrors?.schoolName && inputErrorCls)}
            />
          </Field>
          <Field label="Phone" hint="Shown on receipts and the letterhead.">
            <input name="phone" defaultValue={settings.phone} placeholder="+252 61 …" className={inputCls} />
          </Field>
          <Field label="Email" error={state.fieldErrors?.email}>
            <input name="email" type="email" defaultValue={settings.email} placeholder="office@school.so" className={cn(inputCls, state.fieldErrors?.email && inputErrorCls)} />
          </Field>
          <Field label="Address">
            <input name="address" defaultValue={settings.address} placeholder="Wadada Maka Al-Mukarama, Muqdisho" className={inputCls} />
          </Field>

          {/* Logo */}
          <Field label="School logo" error={state.fieldErrors?.logoData} hint="PNG/JPG/SVG under 300 KB. Appears in the sidebar and on receipts." className="sm:col-span-2">
            <div className="flex items-center gap-4">
              <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                {logoPreview && !removeLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoPreview} alt="Logo preview" className="size-full object-contain" />
                ) : (
                  <ImagePlus className="size-5 text-slate-300" />
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={btnSecondary} onClick={() => fileRef.current?.click()}>
                  <ImagePlus className="size-4" /> Choose image…
                </button>
                {logoPreview && !removeLogo && (
                  <button
                    type="button"
                    className={cn(btnSecondary, "text-red-600 hover:bg-red-50")}
                    onClick={() => {
                      setRemoveLogo(true);
                      setLogoData("");
                    }}
                  >
                    <Trash2 className="size-4" /> Remove
                  </button>
                )}
                {removeLogo && <span className="self-center text-xs font-medium text-red-600">Logo will be removed on save.</span>}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickLogo} />
              <input type="hidden" name="logoData" value={logoData} />
              <input type="checkbox" name="removeLogo" checked={removeLogo} onChange={(e) => setRemoveLogo(e.target.checked)} className="hidden" aria-hidden />
            </div>
          </Field>
        </div>
      </section>

      {/* Localization */}
      <section>
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">Currency & language</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Currency" hint="Used everywhere amounts are displayed.">
            <select
              name="currency"
              value={currencySel}
              onChange={(e) => setCurrencySel(e.target.value)}
              className={inputCls}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
              <option value="CUSTOM">Custom code…</option>
            </select>
          </Field>
          {currencySel === "CUSTOM" && (
            <Field label="Custom currency code" required error={state.fieldErrors?.customCurrency}>
              <input
                name="customCurrency"
                defaultValue={CURRENCIES.some((c) => c.code === settings.currency) ? "" : settings.currency}
                placeholder="e.g. AED"
                maxLength={6}
                className={cn(inputCls, "uppercase", state.fieldErrors?.customCurrency && inputErrorCls)}
              />
            </Field>
          )}
          <Field label="Interface language / Luqadda">
            <select name="language" defaultValue={settings.language} className={inputCls}>
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      {/* Numbering & receipts */}
      <section>
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">Roll numbers & receipts</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Roll number prefix" hint={`Next auto roll: ${settings.rollPrefix}-${String(settings.nextRollSeq).padStart(4, "0")}`}>
            <input name="rollPrefix" defaultValue={settings.rollPrefix} maxLength={10} className={inputCls} />
          </Field>
          <Field label="Receipt prefix" hint={`Next receipt: ${settings.receiptPrefix}-${String(settings.nextReceiptSeq).padStart(5, "0")}`}>
            <input name="receiptPrefix" defaultValue={settings.receiptPrefix} maxLength={10} className={inputCls} />
          </Field>
          <Field label="Receipt footer" className="sm:col-span-2">
            <textarea
              name="receiptFooter"
              defaultValue={settings.receiptFooter}
              rows={2}
              placeholder="e.g. Fees are due before the 10th of each month. Fadlan keen rasiidhka marka aad su'aal qabto."
              className={inputCls}
            />
          </Field>
        </div>
      </section>

      <div className="flex items-center gap-2 border-t border-slate-100 pt-5">
        <button type="submit" className={btnPrimary} disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
          Save settings
        </button>
      </div>
    </form>
  );
}
