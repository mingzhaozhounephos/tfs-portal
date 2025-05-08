import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from '@/lib/supabase';

interface LoginFormProps {
  onSwitchToSignUp?: () => void;
}

export function LoginForm({ onSwitchToSignUp }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState<string | null>(null);
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
    checkSession();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setHasError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      setHasError(error.message);
      return;
    }

    // Redirect to dashboard after successful login
    router.replace("/dashboard");
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
            <h2 className="text-2xl font-bold">Welcome back</h2>
            <p className="text-sm text-gray-600 mt-2">
              Enter your credentials below to access your training dashboard
            </p>
          </div>
          <button className="w-full border border-gray-200 rounded-md py-2 font-medium mb-2">
            Login
          </button>
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
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <Link href="#" className="text-xs text-gray-500 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
                value={password}
                onChange={e => setPassword(e.target.value)}
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
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <p className="text-xs text-center text-gray-500">
            By continuing, you agree to our{" "}
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
            Don&apos;t have an account?{" "}
            <button
              type="button"
              className="text-neutral-900 font-semibold hover:underline"
              onClick={onSwitchToSignUp}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
