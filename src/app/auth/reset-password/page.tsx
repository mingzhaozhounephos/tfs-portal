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
    <div className="min-h-screen flex items-center justify-center bg-[#f7f8fa] px-2">
      <div className="flex w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        {/* Left Panel */}
        <div className="hidden md:flex flex-col justify-between bg-[#EA384C] text-white w-1/2 p-10 relative">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-white text-[#EA384C] font-bold rounded-lg px-3 py-2 text-lg shadow-sm">
                TFS
              </div>
              <span className="font-semibold text-xl">Express Logistics</span>
            </div>
            <h1 className="text-3xl font-bold leading-tight mb-2">
              Welcome to the TFS
              <br />
              Driver Portal
            </h1>
            <p className="text-base text-white/80 mb-6">
              Access training videos, documentation, and resources all in one
              place.
            </p>
            <div className="bg-[#f75a68] bg-opacity-90 rounded-xl p-6 mt-8 shadow-inner">
              <h2 className="text-lg font-semibold mb-2">
                Why use Driver Hub?
              </h2>
              <ul className="text-sm space-y-2 list-disc list-inside text-white/80">
                <li>Access all training materials in one place</li>
                <li>Stay up-to-date with company policies</li>
                <li>Complete required training at your own pace</li>
                <li>Access resources on the go from any device</li>
              </ul>
            </div>
          </div>
        </div>
        {/* Right Panel */}
        <div className="flex flex-1 flex-col justify-center items-center bg-white py-12 px-6">
          <div className="w-full max-w-md">
            <div className="bg-white border border-gray-200 rounded-xl shadow p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-1 text-gray-900">
                  Set Your Password
                </h2>
                <p className="text-sm text-gray-600">
                  Please set a password for your account to continue
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium mb-1 text-gray-700"
                  >
                    New Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#EA384C]"
                    placeholder="Enter your new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-medium mb-1 text-gray-700"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#EA384C]"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                {hasError && <p className="text-red-600 text-xs">{hasError}</p>}
                <button
                  type="submit"
                  className="w-full bg-[#EA384C] text-white rounded-md py-2 font-semibold transition hover:bg-[#d92d3a] focus:outline-none focus:ring-2 focus:ring-[#EA384C] focus:ring-offset-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <svg
                        className="w-4 h-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                      </svg>
                      Processing
                    </span>
                  ) : (
                    "Set Password"
                  )}
                </button>
              </form>
              <p className="text-xs text-center mt-4 text-gray-500">
                By continuing, you agree to our{" "}
                <a href="#" className="text-[#EA384C] hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-[#EA384C] hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
