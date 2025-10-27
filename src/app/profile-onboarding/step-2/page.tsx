"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ProfileStep2Page() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [addressLine1, setAddressLine1] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") router.push("/signin");
  }, [status, router]);

  const email = session?.user?.email?.trim().toLowerCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email) {
      setError("User email not found");
      setLoading(false);
      return;
    }

    try {
      const body: any = {
        email,
        address: { line1: addressLine1 },
        onboardingStep: 2,
      };


      // body.bio = bio; //only if add schema

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Failed to update profile");
      }

      router.push("/profile");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    setError("");

    if (!email) {
      setError("User email not found");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          onboardingStep: 3,
        }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Failed to skip profile step");
      }

      router.push("/profile");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = status !== "authenticated" || loading;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold">Step 2: Additional Info</h2>

        {error && <p className="text-red-500">{error}</p>}

        <div>
          <label className="block mb-1">Address (Line 1)</label>
          <input
            type="text"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            placeholder="Your address"
            className="border rounded w-full p-2"
            disabled={isDisabled}
          />
        </div>

        {/* Optional bio - needs addition in schema */}
        <div>
          <label className="block mb-1">Short Bio (optional)</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself"
            className="border rounded w-full p-2"
            rows={4}
            disabled={isDisabled}
          />
        </div>

        <button
          type="submit"
          disabled={isDisabled}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          {loading ? "Saving..." : "Continue"}
        </button>

        <button
          type="button"
          onClick={handleSkip}
          disabled={isDisabled}
          className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
        >
          {loading ? "Skipping..." : "Skip"}
        </button>
      </form>
    </div>
  );
}
