'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface DietPlan {
  id: string
  calories: number
  breakfast: string
  morningSnack: string
  lunch: string
  eveningSnack: string
  dinner: string
  hydration: string
  foodsToAvoid: string
  lifestyleTips: string
  createdAt: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([])
  const [latestPlan, setLatestPlan] = useState<DietPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchDietPlans = async () => {
      const res = await fetch('/api/diet-plans')
      if (res.ok) {
        const data = await res.json()
        setDietPlans(data.dietPlans)
        if (data.dietPlans.length > 0) {
          setLatestPlan(data.dietPlans[0])
        }
      }
      setLoading(false)
    }
    if (session) fetchDietPlans()
  }, [session])

  const handleGenerateNewPlan = async () => {
    setGenerating(true)
    const res = await fetch('/api/diet-plan', { method: 'POST' })
    if (res.ok) {
      const data = await res.json()
      setLatestPlan(data.dietPlan)
      setDietPlans([data.dietPlan, ...dietPlans])
    }
    setGenerating(false)
  }

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-emerald-800">AI Diet Planner</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Welcome, {session?.user?.name || session?.user?.email}</span>
          <Link href="/profile" className="text-emerald-600 hover:text-emerald-700 font-medium">
            Edit Profile
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={handleGenerateNewPlan}
            disabled={generating}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 font-medium"
          >
            {generating ? 'Generating...' : '🔄 Generate New Diet Plan'}
          </button>
          <Link
            href="/profile"
            className="bg-white text-emerald-600 border-2 border-emerald-600 px-6 py-3 rounded-lg hover:bg-emerald-50 transition-colors font-medium"
          >
            ✏️ Edit Health Profile
          </Link>
        </div>

        {/* Latest Diet Plan */}
        {latestPlan ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-emerald-800">Your Personalized Diet Plan</h2>
                <p className="text-gray-500">
                  Generated on {new Date(latestPlan.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg font-bold text-lg">
                {latestPlan.calories} cal/day
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Meals */}
              <div className="space-y-4">
                <MealCard title="🌅 Breakfast" content={latestPlan.breakfast} color="bg-orange-50" />
                <MealCard title="🍎 Morning Snack" content={latestPlan.morningSnack} color="bg-yellow-50" />
                <MealCard title="🍽️ Lunch" content={latestPlan.lunch} color="bg-green-50" />
                <MealCard title="🥤 Evening Snack" content={latestPlan.eveningSnack} color="bg-blue-50" />
                <MealCard title="🌙 Dinner" content={latestPlan.dinner} color="bg-purple-50" />
              </div>

              {/* Recommendations */}
              <div className="space-y-4">
                <div className="bg-cyan-50 p-4 rounded-xl border-l-4 border-cyan-500">
                  <h3 className="font-bold text-cyan-800 mb-2">💧 Hydration</h3>
                  <p className="text-cyan-700">{latestPlan.hydration}</p>
                </div>

                <div className="bg-red-50 p-4 rounded-xl border-l-4 border-red-500">
                  <h3 className="font-bold text-red-800 mb-2">🚫 Foods to Avoid</h3>
                  <div className="flex flex-wrap gap-2">
                    {latestPlan.foodsToAvoid.split(', ').map((food, i) => (
                      <span key={i} className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                        {food}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-emerald-50 p-4 rounded-xl border-l-4 border-emerald-500">
                  <h3 className="font-bold text-emerald-800 mb-2">💡 Lifestyle Tips</h3>
                  <ul className="space-y-2">
                    {latestPlan.lifestyleTips.split(', ').map((tip, i) => (
                      <li key={i} className="text-emerald-700 text-sm flex items-start">
                        <span className="mr-2">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">No Diet Plan Yet</h2>
            <p className="text-gray-500 mb-6">Complete your health profile and generate your first personalized diet plan!</p>
            <Link
              href="/profile"
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Go to Profile
            </Link>
          </div>
        )}

        {/* Previous Plans */}
        {dietPlans.length > 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-emerald-800 mb-4">Previous Plans</h3>
            <div className="space-y-3">
              {dietPlans.slice(1).map((plan) => (
                <div
                  key={plan.id}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-800">{plan.calories} calories</p>
                    <p className="text-sm text-gray-500">
                      {new Date(plan.createdAt).toLocaleDateString()} at{' '}
                      {new Date(plan.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className="text-emerald-600 text-sm font-medium">View Details →</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MealCard({ title, content, color }: { title: string; content: string; color: string }) {
  return (
    <div className={`${color} p-4 rounded-xl`}>
      <h3 className="font-bold text-gray-800 mb-1">{title}</h3>
      <p className="text-gray-700 text-sm">{content}</p>
    </div>
  )
}