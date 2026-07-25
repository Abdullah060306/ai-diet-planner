"use client"

export const dynamic = 'force-dynamic'

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function DietPlanPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const generatePlan = async () => {
    setGenerating(true)
    try {
      const res = await fetch("/api/diet-plan", { method: "POST" })
      if (res.ok) {
        router.push("/dashboard")
      } else {
        const data = await res.json()
        alert(data.error || "Failed to generate plan")
      }
    } catch (error) {
      alert("Something went wrong")
    } finally {
      setGenerating(false)
    }
  }

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="text-emerald-600 hover:underline mb-4 inline-block">← Back to Dashboard</Link>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center mt-4">
          <div className="text-6xl mb-4">🥗</div>
          <h1 className="text-3xl font-bold text-emerald-800 mb-4">Generate AI Diet Plan</h1>
          <p className="text-gray-600 mb-8">
            Our AI will analyze your health profile and create a personalized diet plan just for you.
          </p>
          
          <button
            onClick={generatePlan}
            disabled={generating}
            className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 transition disabled:opacity-50 shadow-lg"
          >
            {generating ? "Generating your plan..." : "✨ Generate My Plan"}
          </button>
        </div>
      </div>
    </div>
  )
}