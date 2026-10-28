import { useEffect, useState } from "react";
import { XIcon } from "@phosphor-icons/react";
import { useAppDispatch, useAppSelector } from "../../redux/app/hook";
import { saveMyProfile } from "../../redux/features/Profile/profileSlice";
import { useToast } from "../../hooks/useToast";

const input = "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50";

export const EditProfileModal = ({ onClose }: { onClose: () => void }) => {
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const p = useAppSelector((s) => s.profile.data);
  const [form, setForm] = useState({
    location: p?.location ?? "", experience: p?.experience ?? "", description: p?.description ?? "",
    contactPhone: p?.contact_phone ?? "", contactEmail: p?.contact_email ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !saving) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [saving, onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = form.contactEmail.trim(), phone = form.contactPhone.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Enter a valid contact email");
    if (phone && !/^[+()\d\s-]{7,20}$/.test(phone)) return setError("Enter a valid phone number");
    setError("");
    setSaving(true);
    try {
      await dispatch(saveMyProfile(form)).unwrap(); // blank values clear the field on the server
      showToast("Profile saved");
      onClose();
    } catch (err) {
      setError(typeof err === "string" ? err : "Could not save your profile");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4" onClick={() => !saving && onClose()}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="max-h-[92vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl bg-white p-7 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Edit profile</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100"><XIcon size={18} /></button>
        </div>
        <label className="block"><span className="mb-1 block text-xs font-semibold text-gray-500">Location</span>
          <input value={form.location} onChange={set("location")} maxLength={150} placeholder="e.g. Kolkata, India" className={input} /></label>
        <label className="block"><span className="mb-1 block text-xs font-semibold text-gray-500">Experience</span>
          <input value={form.experience} onChange={set("experience")} maxLength={100} placeholder="e.g. 4 years in frontend development" className={input} /></label>
        <label className="block">
          <span className="mb-1 flex justify-between text-xs font-semibold text-gray-500">Bio <span className="font-normal text-gray-400">{form.description.length}/1000</span></span>
          <textarea value={form.description} onChange={set("description")} maxLength={1000} rows={4} placeholder="A few lines about you" className={`${input} resize-none`} /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block"><span className="mb-1 block text-xs font-semibold text-gray-500">Phone</span>
            <input value={form.contactPhone} onChange={set("contactPhone")} maxLength={30} placeholder="+91 98765 43210" className={input} /></label>
          <label className="block"><span className="mb-1 block text-xs font-semibold text-gray-500">Contact email</span>
            <input type="email" value={form.contactEmail} onChange={set("contactEmail")} maxLength={255} placeholder="you@company.com" className={input} /></label>
        </div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} disabled={saving} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50">{saving ? "Saving…" : "Save changes"}</button>
        </div>
      </form>
    </div>
  );
};