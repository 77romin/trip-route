import AuthForm from "@/components/auth/AuthForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "로그인 — TripRoute",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
