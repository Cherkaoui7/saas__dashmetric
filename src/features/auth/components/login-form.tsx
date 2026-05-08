"use client"

import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  LoginInput,
  loginSchema,
} from "@/features/auth/schemas/auth-schema"

export function LoginForm() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginInput) {
    const response = await signIn("credentials", {
      ...data,
      redirect: false,
    })

    if (!response?.error) {
      router.push("/dashboard")
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <input
        {...register("email")}
        placeholder="Email"
        type="email"
        className="w-full rounded border p-2"
      />

      <input
        {...register("password")}
        placeholder="Password"
        type="password"
        className="w-full rounded border p-2"
      />

      <button
        type="submit"
        className="rounded bg-black px-4 py-2 text-white"
      >
        Login
      </button>
    </form>
  )
}