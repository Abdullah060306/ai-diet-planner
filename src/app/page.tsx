import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
      <div className="text-center max-w-2xl px-6">
        <h1 className="text-5xl font-bold text-emerald-800 mb-6">
          AI Diet Planner
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Get personalized diet plans powered by AI. Tailored to your health conditions, fitness goals, and body metrics.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium text-lg"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="bg-white text-emerald-600 border-2 border-emerald-600 px-8 py-3 rounded-lg hover:bg-emerald-50 transition-colors font-medium text-lg"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}