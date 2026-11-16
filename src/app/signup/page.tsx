import type { Metadata } from "next";
import AuthCard from "@/components/AuthCard";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = { title: "회원가입" };

export default function SignupPage() {
  return (
    <AuthCard title="회원가입">
      <AuthForm mode="signup" />
    </AuthCard>
  );
}
