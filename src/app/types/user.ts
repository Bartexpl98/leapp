export type UserDTO = {
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
