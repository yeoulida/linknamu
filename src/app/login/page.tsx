import type { Metadata } from "next";
import AuthCard from "@/components/AuthCard";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = { title: "로그인" };

export default function LoginPage() {
  return (
    <AuthCard title="로그인">
      <AuthForm mode="login" />
    </AuthCard>
  );
}
