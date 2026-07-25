export const dynamic = 'force-dynamic'

"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [dietPlans, setDietPlans] = useState([])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return <div className="p-8">Loading...</div>
  }

 return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <p className="mb-4">Welcome, {session?.user?.email}</p>
      {/* Keep your existing dashboard UI here */}
    </div>
  )
}