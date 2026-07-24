import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dietPlans = await prisma.dietPlan.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ dietPlans }, { status: 200 })
  } catch (error) {
    console.error('Fetch diet plans error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}