"use server";

import { getServerSession } from "next-auth";
import { dbConnect } from "@/app/lib/mongoose";
import User from "@/app/models/user";

const s = (v: FormDataEntryValue | null) => (typeof v === "string" && v.trim().length ? v.trim() : undefined);
const b = (v: FormDataEntryValue | null) => v === "on" || v === "true" || v === "1";
const i = (v: FormDataEntryValue | null) => {
  if (typeof v !== "string" || v.trim() === "") return undefined;
  const n = Number(v);
  return Number.isInteger(n) && n >= 0 ? n : undefined;
};

export async function saveProfile(formData: FormData) {
  const session = await getServerSession();
  const email = session?.user?.email;
  if (!email) throw new Error("Not signed in");

  const update: any = {};

  // account
  const name = s(formData.get("name"));
  const nickname = s(formData.get("nickname"));
  const phone = s(formData.get("phone"));
  if (name !== undefined) update.name = name;
  if (nickname !== undefined) update.nickname = nickname;
  if (phone !== undefined) update.phone = phone;

  // address
  const address: any = {};
  const line1 = s(formData.get("address.line1"));
  const line2 = s(formData.get("address.line2"));
  const city = s(formData.get("address.city"));
  const postalCode = s(formData.get("address.postalCode"));
  const country = s(formData.get("address.country"));
  if (line1 !== undefined) address.line1 = line1;
  if (line2 !== undefined) address.line2 = line2;
  if (city !== undefined) address.city = city;
  if (postalCode !== undefined) address.postalCode = postalCode;
  if (country !== undefined) address.country = country;
  if (Object.keys(address).length) update.address = address;

  // preferences
  const theme = s(formData.get("theme"));
  const language = s(formData.get("language"));
  const notifEmail = b(formData.get("notifEmail"));
  const notifSms = b(formData.get("notifSms"));
  const notifPush = b(formData.get("notifPush"));
  const prefs: any = {};
  if (theme === "light" || theme === "dark") prefs.theme = theme;
  const langs = ["en", "fr", "es", "de", "hi", "ml"] as const;
  if (language && (langs as readonly string[]).includes(language)) prefs.language = language;
  prefs.notifications = { email: notifEmail, sms: notifSms, push: notifPush };
  update.preferences = prefs; 

  // onboarding flags 
  const onboardingStep = i(formData.get("onboardingStep"));
  if (onboardingStep !== undefined) update.onboardingStep = onboardingStep;
  if (formData.has("profileCompleted")) update.profileCompleted = b(formData.get("profileCompleted"));

  await dbConnect();
  await User.findOneAndUpdate({ email }, { $set: update }, { new: true }).lean();

  return { ok: true };
}
