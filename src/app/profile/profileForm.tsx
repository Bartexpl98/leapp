"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveProfile } from "./actions";

type UserDTO = {
  nickname?: string;
};

export default function ProfileForm({ initialUser }: { initialUser: UserDTO }) {
  const [msg, setMsg] = useState("");
  const router = useRouter();

  return (
    <form
      action={async (fd) => {
        setMsg("Saving…");
        try {
          await saveProfile(fd);
          router.refresh();
          setMsg("Saved ✅");
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : "Save failed";
          setMsg(message);
        } finally {
          setTimeout(() => setMsg(""), 2000);
        }
      }}
      className="space-y-6"
    >
      <section className="rounded-2xl border border-white/10 bg-zinc-800/70 p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Nickname</h2>
            <p className="text-sm text-zinc-400">Update your display name.</p>
          </div>
          <span className="text-sm text-zinc-400">{msg}</span>
        </div>

        <Field label="Nickname" name="nickname" defaultValue={initialUser.nickname || ""} />
      </section>

      <div className="flex justify-end">
        <button type="submit" className="rounded-xl bg-violet-600/90 px-4 py-2 text-white hover:bg-violet-600">
          Save changes
        </button>
      </div>
    </form>
  );
}

function Field(props: { label: string; name: string; defaultValue?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-zinc-300">{props.label}</span>
      <input
        name={props.name}
        defaultValue={props.defaultValue}
        className="w-full rounded-lg bg-zinc-900/60 p-2 text-zinc-100 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-violet-500"
      />
    </label>
  );
}
