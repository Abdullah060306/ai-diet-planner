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
    where: { email: session.user.email },
    include: { profile: true }
  })
  
  return NextResponse.json({ profile: user?.profile || null })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  const data = await req.json()
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })
  
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }
  
  const profile = await prisma.profile.upsert({
    where: { userId: user.id },
    update: {
      fullName: data.fullName,
      age: data.age,
      gender: data.gender,
      height: data.height,
      weight: data.weight,
      healthConditions: data.healthConditions,
      fitnessGoal: data.fitnessGoal,
    },
    create: {
      userId: user.id,
      fullName: data.fullName,
      age: data.age,
      gender: data.gender,
      height: data.height,
      weight: data.weight,
      healthConditions: data.healthConditions,
      fitnessGoal: data.fitnessGoal,
    }
  })
  
  return NextResponse.json({ profile })
}