import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })
  
  if (!user) return NextResponse.json([])
  
  const plans = await prisma.dietPlan.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  })
  
  return NextResponse.json(plans)
}