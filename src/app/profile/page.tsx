import { dbConnect } from "@/app/lib/mongoose";
import User, { UserDoc } from "@/app/models/user";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth-options";
import ProfileForm from "./profileForm";

export const dynamic = 'force-dynamic';


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
  gdprConsent?: { accepted: boolean; acceptedAt?: string; version?: string };
  createdAt?: string;
  updatedAt?: string;
};

export default async function ProfilePage() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.trim().toLowerCase();

  if (!email) {
    return (
      <div className="min-h-screen bg-zinc-900 text-zinc-100 p-6">
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }

  const u = await User.findOne({ email }).lean<UserDoc | null>();
  if (!u) {
    return (
      <div className="min-h-screen bg-zinc-900 text-zinc-100 p-6">
        <p>No profile found for {email}.</p>
      </div>
    );
  }

  const user: UserDTO = {
    email: u.email,
    phone: u.phone,
    name: u.name,
    nickname: u.nickname,
    address: u.address,
    preferences: {
      theme: u.preferences?.theme,
      language: u.preferences?.language,
      notifications: u.preferences?.notifications,
    },
    onboardingStep: u.onboardingStep,
    profileCompleted: u.profileCompleted,
    gdprConsent: u.gdprConsent
      ? {
          accepted: !!u.gdprConsent.accepted,
          acceptedAt: u.gdprConsent.acceptedAt ? new Date(u.gdprConsent.acceptedAt).toISOString() : undefined,
          version: u.gdprConsent.version,
        }
      : undefined,
    createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : undefined,
    updatedAt: u.updatedAt ? new Date(u.updatedAt).toISOString() : undefined,
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-900 text-zinc-100">
      <div className="mx-auto max-w-5xl px-4 md:px-8 py-8 space-y-6">
        <header>
          <h1 className="text-2xl md:text-3xl font-semibold">Profile</h1>
          <p className="text-sm text-zinc-400">Manage your account & preferences.</p>
        </header>
        <ProfileForm initialUser={user} />
      </div>
    </div>
  );
}
