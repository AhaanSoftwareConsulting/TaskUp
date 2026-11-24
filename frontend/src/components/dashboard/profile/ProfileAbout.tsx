import {
  BriefcaseIcon,
  EnvelopeSimpleIcon,
  MapPinIcon,
  PhoneIcon,
  UserCircleIcon,
  CheckCircleIcon,
  ArrowUpRightIcon,
  SparkleIcon,
} from "@phosphor-icons/react";

import type { ComponentType } from "react";
import type { IconProps } from "@phosphor-icons/react";

import { useAppSelector } from "../../redux/app/hook";

export const ProfileAbout = ({ onEdit }: { onEdit: () => void }) => {
  const p = useAppSelector((s) => s.profile.data);
  const loading = useAppSelector((s) => s.profile.loading);

  if (!p && loading) {
    return (
      <div className="space-y-5">
        <div className="h-32 animate-pulse rounded-2xl bg-gray-100" />
        <div className="h-40 animate-pulse rounded-2xl bg-gray-100" />
        <div className="h-52 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    );
  }

  const fields: {
    label: string;
    value: string | null;
    Icon: ComponentType<IconProps>;
    href?: string;
    color: string;
    iconBg: string;
  }[] = [
    {
      label: "Location",
      value: p?.location ?? null,
      Icon: MapPinIcon,
      color: "text-blue-600",
      iconBg: "bg-blue-50",
    },
    {
      label: "Experience",
      value: p?.experience ?? null,
      Icon: BriefcaseIcon,
      color: "text-violet-600",
      iconBg: "bg-violet-50",
    },
    {
      label: "Phone",
      value: p?.contact_phone ?? null,
      Icon: PhoneIcon,
      href: p?.contact_phone
        ? `tel:${p.contact_phone.replace(/[^\d+]/g, "")}`
        : undefined,
      color: "text-emerald-600",
      iconBg: "bg-emerald-50",
    },
    {
      label: "Contact email",
      value: p?.contact_email ?? null,
      Icon: EnvelopeSimpleIcon,
      href: p?.contact_email
        ? `mailto:${p.contact_email}`
        : undefined,
      color: "text-orange-600",
      iconBg: "bg-orange-50",
    },
  ];

  const checks: [string, unknown][] = [
    ["a photo", p?.profile_image],
    ["a bio", p?.description],
    ["your location", p?.location],
    ["your experience", p?.experience],
    ["a phone number", p?.contact_phone],
    ["a contact email", p?.contact_email],
  ];

  const missing = checks
    .filter(([, value]) => !value)
    .map(([label]) => label);

  const pct = Math.round(
    ((checks.length - missing.length) / checks.length) * 100
  );

  return (
    <div className="space-y-5">

      {/* Profile Completeness */}
      <section className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">

        <div className="flex items-start justify-between gap-4">

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#278CFA]">
              <SparkleIcon size={21} weight="duotone" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#171B2E]">
                Profile Completeness
              </h3>

              <p className="mt-0.5 text-xs text-gray-400">
                Keep your profile up to date
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-2xl font-extrabold tracking-tight text-[#171B2E]">
              {pct}%
            </span>

            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Completed
            </p>
          </div>

        </div>

        {/* Progress Bar */}
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#278CFA] to-[#6554E8] transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between">

          <div className="flex items-center gap-1.5">
            <CheckCircleIcon
              size={14}
              weight="fill"
              className={
                pct === 100 ? "text-emerald-500" : "text-gray-300"
              }
            />

            <span className="text-[11px] font-medium text-gray-400">
              {pct === 100
                ? "Your profile is complete!"
                : "Profile progress"}
            </span>
          </div>

          {pct !== 100 && (
            <button
              onClick={onEdit}
              className="flex items-center gap-1 text-[11px] font-bold text-[#278CFA] transition-colors hover:text-[#6554E8]"
            >
              Complete profile
              <ArrowUpRightIcon size={13} weight="bold" />
            </button>
          )}

        </div>

        {missing.length > 0 && (
          <p className="mt-3 rounded-xl bg-blue-50/70 px-3 py-2.5 text-xs leading-relaxed text-blue-600">
            Add {missing.slice(0, 3).join(", ")}
            {missing.length > 3 ? " and more" : ""} to complete your profile.
          </p>
        )}

      </section>

      {/* About Section */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">

        <div className="mb-5 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <UserCircleIcon size={21} weight="duotone" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#171B2E]">
                About Me
              </h3>

              <p className="mt-0.5 text-[11px] text-gray-400">
                A little introduction about yourself
              </p>
            </div>
          </div>

          <button
            onClick={onEdit}
            className="rounded-lg px-3 py-1.5 text-[11px] font-semibold text-[#278CFA] transition-colors hover:bg-blue-50"
          >
            Edit
          </button>

        </div>

        {p?.description ? (
          <div className="rounded-xl bg-gray-50/80 p-4">
            <p className="whitespace-pre-wrap text-sm leading-7 text-gray-600">
              {p.description}
            </p>
          </div>
        ) : (
          <button
            onClick={onEdit}
            className="flex w-full items-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-5 text-left transition-all hover:border-blue-200 hover:bg-blue-50/30"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-gray-400">
              <UserCircleIcon size={20} />
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500">
                No bio added yet
              </p>

              <p className="mt-1 text-[11px] text-gray-400">
                Add a short introduction so your team knows you better.
              </p>
            </div>

            <ArrowUpRightIcon
              size={16}
              className="ml-auto shrink-0 text-gray-400"
            />
          </button>
        )}

      </section>

      {/* Personal Details */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">

        <div className="mb-5 flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <BriefcaseIcon size={21} weight="duotone" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#171B2E]">
              Personal Details
            </h3>

            <p className="mt-0.5 text-[11px] text-gray-400">
              Your professional and contact information
            </p>
          </div>

        </div>

        <dl className="grid gap-3 sm:grid-cols-2">

          {fields.map(({ label, value, Icon, href, color, iconBg }) => (
            <div
              key={label}
              className="group flex min-w-0 items-center gap-3 rounded-xl border border-gray-100 bg-white p-3.5 transition-all duration-200 hover:border-blue-100 hover:bg-blue-50/30"
            >

              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg} ${color} transition-transform duration-200 group-hover:scale-105`}
              >
                <Icon size={19} weight="duotone" />
              </div>

              <div className="min-w-0 flex-1">

                <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {label}
                </dt>

                <dd className="mt-1 truncate text-xs font-semibold text-[#34394D]">
                  {value ? (
                    href ? (
                      <a
                        href={href}
                        className="transition-colors hover:text-[#278CFA] hover:underline"
                      >
                        {value}
                      </a>
                    ) : (
                      <span>{value}</span>
                    )
                  ) : (
                    <span className="font-normal italic text-gray-300">
                      Not added yet
                    </span>
                  )}
                </dd>

              </div>

              {href && value && (
                <ArrowUpRightIcon
                  size={14}
                  className="shrink-0 text-gray-300 transition-colors group-hover:text-[#278CFA]"
                />
              )}

            </div>
          ))}

        </dl>

      </section>

    </div>
  );
};