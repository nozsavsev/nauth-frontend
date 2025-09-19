import useUser from "@/hooks/useUser";
import { MoveRightIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function EnterName({ onSuccess }: { onSuccess: (name: string) => void }) {
  const { user } = useUser();

  const [name, setName] = useState<string>("");

  useEffect(() => {
    setName(`My 2FA ${user?.twoFactorAuthEntries?.length ? user?.twoFactorAuthEntries?.length + 1 : 1}`);
  }, [user?.twoFactorAuthEntries]);

  return (
    <div>
      <p>NAUTH account can be used by many people.</p>
      <p>
        For your convinience please name this second factor
        <br /> so you can manage it with ease later.
      </p>
      <div className="flex items-center justify-center">
        <input
          type="text"
          value={name}
          placeholder="Name this factor"
          onChange={(e) => setName(e.target.value)}
          className="my-5 w-64 rounded-lg border border-solid border-neutral-400 px-3 py-2 outline-offset-2 outline-transparent"
        />

        <button
          disabled={name.length === 0}
          className="text-neutral-000 ml-4 h-fit rounded-lg border border-solid border-neutral-400 bg-white px-3 py-2 font-semibold transition-all disabled:opacity-40"
          onClick={() => {
            onSuccess(name);
          }}
        >
          Continue
          <MoveRightIcon className="ml-2 inline h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
