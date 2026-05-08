import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">
        Dashboard
      </h1>

      <p>
        Welcome {session.user?.email}
      </p>
    </div>
  )
}