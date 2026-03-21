import AuthForm from "@/components/auth/AuthForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "회원가입 — TripRoute",
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
