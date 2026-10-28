import { BriefcaseIcon, EnvelopeSimpleIcon, MapPinIcon, PhoneIcon } from "@phosphor-icons/react";
import type { ComponentType } from "react";
import { useAppSelector } from "../../redux/app/hook";

export const ProfileAbout = ({ onEdit }: { onEdit: () => void }) => {
  const p = useAppSelector((s) => s.profile.data);
  const loading = useAppSelector((s) => s.profile.loading);

  if (!p && loading) return <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />;

  const fields: { label: string; value: string | null; Icon: ComponentType<{ size?: number; className?: string }>; href?: string }[] = [
    { label: "Location", value: p?.location ?? null, Icon: MapPinIcon },
    { label: "Experience", value: p?.experience ?? null, Icon: BriefcaseIcon },
    { label: "Phone", value: p?.contact_phone ?? null, Icon: PhoneIcon, href: p?.contact_phone ? `tel:${p.contact_phone.replace(/[^\d+]/g, "")}` : undefined },
    { label: "Contact email", value: p?.contact_email ?? null, Icon: EnvelopeSimpleIcon, href: p?.contact_email ? `mailto:${p.contact_email}` : undefined },
  ];
  const checks: [string, unknown][] = [["a photo", p?.profile_image], ["a bio", p?.description], ["your location", p?.location],
    ["your experience", p?.experience], ["a phone number", p?.contact_phone], ["a contact email", p?.contact_email]];
  const missing = checks.filter(([, v]) => !v).map(([l]) => l);
  const pct = Math.round(((checks.length - missing.length) / checks.length) * 100);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Profile completeness</h3>
          <span className="text-sm font-black text-gray-800">{pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${pct}%` }} /></div>
        {missing.length > 0 && <p className="mt-2 text-xs text-gray-400">Add {missing.slice(0, 3).join(", ")}{missing.length > 3 ? " and more" : ""} to complete your profile.</p>}
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-gray-400">About</h3>
        {p?.description ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{p.description}</p>
        ) : (
          <button onClick={onEdit} className="text-sm italic text-gray-400 hover:text-blue-600">Add a short bio so your team knows you better…</button>
        )}
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-gray-400">Details</h3>
        <dl className="grid gap-5 sm:grid-cols-2">
          {fields.map(({ label, value, Icon, href }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-500"><Icon size={18} /></div>
              <div className="min-w-0">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</dt>
                <dd className="truncate text-sm font-medium">
                  {value ? (href ? <a href={href} className="text-blue-600 hover:underline">{value}</a> : <span className="text-gray-800">{value}</span>)
                    : <span className="italic text-gray-300">Not added yet</span>}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
};