"use client"

export const dynamic = 'force-dynamic'

import { useSession, signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [dietPlans, setDietPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
    if (status === "authenticated") {
      fetchDietPlans()
    }
  }, [status, router])

  const fetchDietPlans = async () => {
    try {
      const res = await fetch("/api/diet-plans")
      if (res.ok) {
        const data = await res.json()
        setDietPlans(data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-xl font-semibold text-emerald-800">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-emerald-800">AI Diet Planner</h1>
        <div className="flex gap-4 items-center">
          <span className="text-gray-600">{session?.user?.email}</span>
          <Link href="/profile" className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition">
            Profile
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
            <p className="text-gray-600 mt-1">Welcome back! Manage your diet plans here.</p>
          </div>
          <Link
            href="/diet-plan"
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition shadow-lg"
          >
            + Generate New Plan
          </Link>
        </div>

        {dietPlans.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">🥗</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Diet Plans Yet</h3>
            <p className="text-gray-600 mb-6">Create your first personalized AI diet plan by filling out your profile.</p>
            <Link
              href="/profile"
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition"
            >
              Complete Profile First
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dietPlans.map((plan) => (
              <div key={plan.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{plan.calories} kcal Plan</h3>
                    <p className="text-sm text-gray-500">{new Date(plan.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                    AI Generated
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Breakfast:</span> <span className="font-medium">{plan.breakfast}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Lunch:</span> <span className="font-medium">{plan.lunch}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Dinner:</span> <span className="font-medium">{plan.dinner}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Hydration:</span> <span className="font-medium text-blue-600">{plan.hydration}</span></div>
                </div>

                {plan.foodsToAvoid && (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg">
                    <p className="text-xs text-red-700 font-semibold">Avoid: {plan.foodsToAvoid}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}