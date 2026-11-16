"use server";

import bcrypt from "bcryptjs";
import { MongoServerError, ObjectId } from "mongodb";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { endSession, startSession } from "@/lib/auth";
import { profileTag } from "@/lib/data";
import { collections } from "@/lib/db";
import { getString, LIMITS, validateEmail, validateUsername } from "@/lib/validation";

export type AuthState = { error?: string } | undefined;

export async function signup(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = getString(formData, "email").toLowerCase();
  const password = formData.get("password");
  const username = getString(formData, "username").toLowerCase();

  const emailError = validateEmail(email);
  if (emailError) return { error: emailError };
  if (typeof password !== "string" || password.length < LIMITS.passwordMin || password.length > 72) {
    return { error: `비밀번호는 ${LIMITS.passwordMin}~72자여야 합니다.` };
  }
  const usernameError = validateUsername(username);
  if (usernameError) return { error: usernameError };

  const { users } = await collections();
  const _id = new ObjectId();
  try {
    await users.insertOne({
      _id,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      username,
      name: username,
      bio: "",
      avatarUrl: null,
      createdAt: new Date(),
    });
  } catch (err) {
    if (err instanceof MongoServerError && err.code === 11000) {
      const field = Object.keys(err.keyPattern ?? {})[0];
      return {
        error: field === "email" ? "이미 가입된 이메일입니다." : "이미 사용 중인 username입니다.",
      };
    }
    throw err;
  }

  // 같은 username으로 캐시된 '없음' 결과를 지운다
  updateTag(profileTag(username));
  await startSession({ userId: _id.toHexString(), username });
  redirect("/admin");
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = getString(formData, "email").toLowerCase();
  const password = formData.get("password");
  if (!email || typeof password !== "string" || !password) {
    return { error: "이메일과 비밀번호를 입력하세요." };
  }

  const { users } = await collections();
  const user = await users.findOne({ email });
  const ok = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !ok) {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  await startSession({ userId: user._id.toHexString(), username: user.username });
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/");
}
