"use client";

import { useState } from "react";
import { SignUpForm } from "../../components/auth/signup-form";
import { LoginForm } from "../../components/auth/login-form";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);

  function handleSwitchToSignUp() {
    setIsSignUp(true);
  }

  function handleSwitchToLogin() {
    setIsSignUp(false);
  }

  return isSignUp ? (
    <SignUpForm onSwitchToLogin={handleSwitchToLogin} />
  ) : (
    <LoginForm onSwitchToSignUp={handleSwitchToSignUp} />
  );
}
