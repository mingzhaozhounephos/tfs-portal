"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setHasError(null);

    if (password !== confirmPassword) {
      setHasError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setHasError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    setIsLoading(false);

    if (error) {
      setHasError(error.message);
      return;
    }

    toast.success("Password updated successfully!", {
      description: "You can now log in with your new password.",
    });

    router.replace("/login");
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side */}
      <div className="hidden md:flex flex-col justify-between bg-neutral-900 text-white w-1/2 p-8">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚗</span>
          <span className="font-semibold text-lg">Driver Training System</span>
        </div>
        <div />
        <div className="mb-4">
          <p className="text-sm">
            &quot;This platform has revolutionized how we train our drivers. The
            video assignments and tracking features have improved our compliance
            and safety records significantly.&quot;
          </p>
          <p className="text-xs mt-2">Sofia Davis, Fleet Manager</p>
        </div>
      </div>
      {/* Right side */}
      <div className="flex flex-1 flex-col justify-center items-center bg-white">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Set Your Password</h2>
            <p className="text-sm text-gray-600 mt-2">
              Please set a password for your account to continue
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-200 rounded-md p-6 space-y-4"
          >
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1"
              >
                New Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium mb-1"
              >
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {hasError && <p className="text-red-600 text-xs">{hasError}</p>}
            <button
              type="submit"
              className="w-full bg-neutral-900 text-white rounded-md py-2 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Setting password..." : "Set Password"}
            </button>
          </form>
          <p className="text-xs text-center text-gray-500">
            By continuing, you agree to our{" "}
            <a href="#" className="underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
