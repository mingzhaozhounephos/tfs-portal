import { useState } from "react";
import Link from "next/link";

interface SignUpFormProps {
  onSwitchToLogin?: () => void;
}

export function SignUpForm({ onSwitchToLogin }: SignUpFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setHasError(null);
    if (password !== confirmPassword) {
      setHasError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    // TODO: Implement sign-up logic
    setTimeout(() => setIsLoading(false), 1000);
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
            "This platform has revolutionized how we train our drivers. The video assignments and tracking features have improved our compliance and safety records significantly."
          </p>
          <p className="text-xs mt-2">Sofia Davis, Fleet Manager</p>
        </div>
      </div>
      {/* Right side */}
      <div className="flex flex-1 flex-col justify-center items-center bg-white">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Create your account</h2>
            <p className="text-sm text-gray-600 mt-2">
              Enter your details below to sign up for the training portal
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-200 rounded-md p-6 space-y-4"
          >
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium mb-1">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>
            {hasError && (
              <p className="text-red-600 text-xs">{hasError}</p>
            )}
            <button
              type="submit"
              className="w-full bg-neutral-900 text-white rounded-md py-2 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Signing up..." : "Sign up"}
            </button>
          </form>
          <p className="text-xs text-center text-gray-500">
            By signing up, you agree to our{" "}
            <Link href="#" className="underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="underline">
              Privacy Policy
            </Link>
            .
          </p>
          <p className="text-sm text-center mt-4">
            Already have an account?{" "}
            <button
              type="button"
              className="text-neutral-900 font-semibold hover:underline"
              onClick={onSwitchToLogin}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
