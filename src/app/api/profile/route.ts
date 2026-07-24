import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      fullName,
      age,
      gender,
      height,
      weight,
      healthConditions,
      fitnessGoal,
    } = body

    const healthConditionsStr = Array.isArray(healthConditions) 
      ? healthConditions.join(',') 
      : healthConditions

    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        fullName,
        age: parseInt(age),
        gender,
        height: parseFloat(height),
        weight: parseFloat(weight),
        healthConditions: healthConditionsStr,
        fitnessGoal,
      },
      create: {
        userId: session.user.id,
        fullName,
        age: parseInt(age),
        gender,
        height: parseFloat(height),
        weight: parseFloat(weight),
        healthConditions: healthConditionsStr,
        fitnessGoal,
      },
    })

    return NextResponse.json({ profile }, { status: 200 })
  } catch (error) {
    console.error('Profile error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    })

    return NextResponse.json({ profile }, { status: 200 })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}