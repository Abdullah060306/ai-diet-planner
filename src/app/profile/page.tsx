"use client"

export const dynamic = 'force-dynamic'

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const healthConditionsList = [
  { id: 'diabetes', label: 'Diabetes' },
  { id: 'hypertension', label: 'High Blood Pressure' },
  { id: 'heart-disease', label: 'Heart Disease' },
  { id: 'high-cholesterol', label: 'High Cholesterol' },
  { id: 'kidney-disease', label: 'Kidney Disease' },
  { id: 'thyroid', label: 'Thyroid Disorders' },
  { id: 'none', label: 'None' },
]

const fitnessGoals = [
  { id: 'weight-loss', label: 'Weight Loss' },
  { id: 'weight-gain', label: 'Weight Gain' },
  { id: 'maintain', label: 'Maintain Weight' },
]

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: 'male',
    height: '',
    weight: '',
    healthConditions: [] as string[],
    fitnessGoal: 'maintain',
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
    if (session) fetchProfile()
  }, [status, router, session])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile')
      if (res.ok) {
        const data = await res.json()
        if (data.profile) {
          setFormData({
            fullName: data.profile.fullName || '',
            age: data.profile.age?.toString() || '',
            gender: data.profile.gender || 'male',
            height: data.profile.height?.toString() || '',
            weight: data.profile.weight?.toString() || '',
            healthConditions: data.profile.healthConditions ? data.profile.healthConditions.split(',') : [],
            fitnessGoal: data.profile.fitnessGoal || 'maintain',
          })
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleConditionChange = (conditionId: string) => {
    setFormData((prev) => {
      if (conditionId === 'none') {
        return { ...prev, healthConditions: ['none'] }
      }
      const newConditions = prev.healthConditions.filter((c) => c !== 'none')
      if (newConditions.includes(conditionId)) {
        return { ...prev, healthConditions: newConditions.filter((c) => c !== conditionId) }
      }
      return { ...prev, healthConditions: [...newConditions, conditionId] }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        age: parseInt(formData.age),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        healthConditions: formData.healthConditions.join(','),
      }),
    })

    if (res.ok) {
      setMessage('Profile saved successfully!')
    } else {
      setMessage('Failed to save profile')
    }
    setLoading(false)
  }

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-emerald-800">Health Profile</h1>
          <Link href="/dashboard" className="text-emerald-600 hover:underline">← Back to Dashboard</Link>
        </div>

        <p className="text-gray-500 mb-6">Tell us about yourself to generate your personalized AI diet plan.</p>

        {message && (
          <div className={`p-3 rounded-lg mb-4 text-sm ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
              <input
                type="number"
                step="0.1"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Health Conditions</label>
            <div className="grid grid-cols-2 gap-2">
              {healthConditionsList.map((condition) => (
                <label key={condition.id} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.healthConditions.includes(condition.id)}
                    onChange={() => handleConditionChange(condition.id)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-sm text-gray-700">{condition.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fitness Goal</label>
            <select
              value={formData.fitnessGoal}
              onChange={(e) => setFormData({ ...formData, fitnessGoal: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {fitnessGoals.map((goal) => (
                <option key={goal.id} value={goal.id}>{goal.label}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}