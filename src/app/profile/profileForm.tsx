"use client";

import { useState } from "react";
import { saveProfile } from "./actions";

type UserDTO = {
  email?: string;
  phone?: string;
  name?: string;
  nickname?: string;
  address?: { line1?: string; line2?: string; city?: string; postalCode?: string; country?: string };
  preferences?: {
    theme?: "light" | "dark";
    language?: "en" | "fr" | "es" | "de" | "hi" | "ml";
    notifications?: { email: boolean; sms: boolean; push?: boolean };
  };
  onboardingStep?: number;
  profileCompleted?: boolean;
};

export default function ProfileForm({ initialUser }: { initialUser: UserDTO }) {
  const [msg, setMsg] = useState("");

  return (
    <form
      action={async (fd) => {
        setMsg("Saving…");
        try {
          await saveProfile(fd);
          setMsg("Saved ✅");
        } catch (e: any) {
          setMsg(e?.message || "Save failed");
        } finally {
          setTimeout(() => setMsg(""), 2000);
        }
      }}
      className="space-y-6"
    >
      {/* Account */}
      <section className="rounded-2xl border border-white/10 bg-zinc-800/70 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Account</h2>
          <span className="text-sm text-zinc-400">{msg}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Email" name="email" defaultValue={initialUser.email || ""} disabled />
          <Field label="Phone" name="phone" defaultValue={initialUser.phone || ""} />
          <Field label="Full name" name="name" defaultValue={initialUser.name || ""} />
          <Field label="Nickname" name="nickname" defaultValue={initialUser.nickname || ""} />
        </div>
      </section>

      {/* Address */}
      <section className="rounded-2xl border border-white/10 bg-zinc-800/70 p-5">
        <h2 className="mb-3 text-lg font-semibold text-white">Address</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Line 1" name="address.line1" defaultValue={initialUser.address?.line1 || ""} />
          <Field label="Line 2" name="address.line2" defaultValue={initialUser.address?.line2 || ""} />
          <Field label="City" name="address.city" defaultValue={initialUser.address?.city || ""} />
          <Field label="Postal code" name="address.postalCode" defaultValue={initialUser.address?.postalCode || ""} />
          <Field label="Country" name="address.country" defaultValue={initialUser.address?.country || ""} />
        </div>
      </section>

      {/* Preferences */}
      <section className="rounded-2xl border border-white/10 bg-zinc-800/70 p-5">
        <h2 className="mb-3 text-lg font-semibold text-white">Preferences</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Theme"
            name="theme"
            defaultValue={initialUser.preferences?.theme || "light"}
            options={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }]}
          />
          <Select
            label="Language"
            name="language"
            defaultValue={initialUser.preferences?.language || "en"}
            options={[
              { value: "en", label: "English" }, { value: "fr", label: "Français" },
              { value: "es", label: "Español" }, { value: "de", label: "Deutsch" },
              { value: "hi", label: "हिंदी" }, { value: "ml", label: "Malayalam" },
            ]}
          />
          <Checkbox label="Email notifications" name="notifEmail" defaultChecked={!!initialUser.preferences?.notifications?.email} />
          <Checkbox label="SMS notifications" name="notifSms" defaultChecked={!!initialUser.preferences?.notifications?.sms} />
          <Checkbox label="Push notifications" name="notifPush" defaultChecked={!!initialUser.preferences?.notifications?.push} />
        </div>
      </section>

      {/* Onboarding flags */}
      <section className="rounded-2xl border border-white/10 bg-zinc-800/70 p-5">
        <h2 className="mb-3 text-lg font-semibold text-white">Onboarding</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NumberField label="Onboarding step" name="onboardingStep" defaultValue={String(initialUser.onboardingStep ?? 0)} min={0} />
          <Checkbox label="Profile completed" name="profileCompleted" defaultChecked={!!initialUser.profileCompleted} />
        </div>
      </section>

      <div className="flex justify-end">
        <button type="submit" className="rounded-xl bg-violet-600/90 px-4 py-2 text-white hover:bg-violet-600">
          Save changes
        </button>
      </div>
    </form>
  );
}

function Field(props: { label: string; name: string; defaultValue?: string; disabled?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-zinc-300">{props.label}</span>
      <input
        name={props.name}
        defaultValue={props.defaultValue}
        disabled={props.disabled}
        className="w-full rounded-lg bg-zinc-900/60 p-2 text-zinc-100 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-60"
      />
    </label>
  );
}

function NumberField(props: { label: string; name: string; defaultValue?: string; min?: number }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-zinc-300">{props.label}</span>
      <input
        type="number"
        name={props.name}
        defaultValue={props.defaultValue}
        min={props.min ?? 0}
        className="w-full rounded-lg bg-zinc-900/60 p-2 text-zinc-100 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-violet-500"
      />
    </label>
  );
}

function Select(props: { label: string; name: string; defaultValue?: string; options: { value: string; label: string }[] }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-zinc-300">{props.label}</span>
      <select
        name={props.name}
        defaultValue={props.defaultValue}
        className="w-full rounded-lg bg-zinc-900/60 p-2 text-zinc-100 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-violet-500"
      >
        {props.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

function Checkbox(props: { label: string; name: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        name={props.name}
        defaultChecked={props.defaultChecked}
        className="h-4 w-4 rounded border-white/10 bg-zinc-900/60 text-violet-600 focus:ring-violet-500"
      />
      <span className="text-zinc-200">{props.label}</span>
    </label>
  );
}
