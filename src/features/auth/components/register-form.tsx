"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  RegisterInput,
  registerSchema,
} from "@/features/auth/schemas/auth-schema"

export function RegisterForm() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: RegisterInput) {
    const response = await fetch("/api/register", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(data),
    })

    if (response.ok) {
      router.push("/login")
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <input
        {...register("name")}
        placeholder="Name"
        className="w-full rounded border p-2"
      />

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
        Register
      </button>
    </form>
  )
}