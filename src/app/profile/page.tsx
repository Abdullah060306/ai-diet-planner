export const dynamic = 'force-dynamic'
"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

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
  const [message, setMessage] = useState('')

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
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch('/api/profile')
      if (res.ok) {
        const data = await res.json()
        if (data.profile) {
          setFormData({
            fullName: data.profile.fullName,
            age: data.profile.age.toString(),
            gender: data.profile.gender,
            height: data.profile.height.toString(),
            weight: data.profile.weight.toString(),
            healthConditions: data.profile.healthConditions ? data.profile.healthConditions.split(',') : [],
            fitnessGoal: data.profile.fitnessGoal,
          })
        }
      }
    }
    if (session) fetchProfile()
  }, [session])

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
    setMessage('')

    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    if (res.ok) {
      setMessage('Profile saved successfully!')
      setTimeout(() => router.push('/dashboard'), 1500)
    } else {
      setMessage('Failed to save profile')
    }
    setLoading(false)
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-emerald-800 mb-2">Health Profile</h1>
        <p className="text-gray-500 mb-6">Tell us about yourself to generate your personalized diet plan</p>

        {message && (
          <div className={`p-3 rounded-lg mb-4 text-sm ${message.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
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
                min="10"
                max="120"
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
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                required
                min="50"
                max="300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                required
                min="20"
                max="500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Health Conditions</label>
            <div className="grid grid-cols-2 gap-2">
              {healthConditionsList.map((condition) => (
                <label
                  key={condition.id}
                  className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    formData.healthConditions.includes(condition.id)
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.healthConditions.includes(condition.id)}
                    onChange={() => handleConditionChange(condition.id)}
                    className="mr-2 accent-emerald-600"
                  />
                  <span className="text-sm">{condition.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fitness Goal</label>
            <div className="grid grid-cols-3 gap-3">
              {fitnessGoals.map((goal) => (
                <label
                  key={goal.id}
                  className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    formData.fitnessGoal === goal.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="fitnessGoal"
                    value={goal.id}
                    checked={formData.fitnessGoal === goal.id}
                    onChange={(e) => setFormData({ ...formData, fitnessGoal: e.target.value })}
                    className="mr-2 accent-emerald-600"
                  />
                  <span className="text-sm font-medium">{goal.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 font-medium text-lg"
          >
            {loading ? 'Saving...' : 'Save Profile & Generate Diet Plan'}
          </button>
        </form>
      </div>
    </div>
  )
}