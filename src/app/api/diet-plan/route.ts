import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { profile: true }
  })
  
  if (!user?.profile) {
    return NextResponse.json({ error: "Please complete your profile first" }, { status: 400 })
  }
  
  const profile = user.profile
  
  // Calculate calories based on profile
  const bmr = profile.gender === 'male' 
    ? 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5
    : 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161
  
  const calories = Math.round(
    profile.fitnessGoal === 'weight-loss' ? bmr * 1.2 - 500 :
    profile.fitnessGoal === 'weight-gain' ? bmr * 1.2 + 500 :
    bmr * 1.2
  )
  
  // Try OpenAI if API key exists
  let planData: any = null
  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{
            role: "system",
            content: "You are a nutritionist. Respond ONLY with valid JSON containing these exact keys: breakfast, morningSnack, lunch, eveningSnack, dinner, hydration, foodsToAvoid, lifestyleTips, calories (number)."
          }, {
            role: "user",
            content: `Create a diet plan for: ${profile.fullName}, Age ${profile.age}, ${profile.gender}, ${profile.height}cm, ${profile.weight}kg. Health: ${profile.healthConditions}. Goal: ${profile.fitnessGoal}. Target calories: ${calories}.`
          }]
        })
      })
      
      const aiData = await response.json()
      const content = aiData.choices[0].message.content
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      planData = jsonMatch ? JSON.parse(jsonMatch[0]) : null
    } catch (error) {
      console.error("OpenAI error:", error)
    }
  }
  
  // Fallback if no OpenAI or it failed
  if (!planData) {
    planData = {
      calories,
      breakfast: "Oatmeal with fresh fruits, almonds, and honey",
      morningSnack: "Greek yogurt with berries",
      lunch: "Grilled chicken breast with quinoa and steamed broccoli",
      eveningSnack: "Handful of mixed nuts and green tea",
      dinner: "Baked salmon with sweet potato and asparagus",
      hydration: "Drink 8-10 glasses of water throughout the day",
      foodsToAvoid: profile.healthConditions?.includes('diabetes') ? "Sugar, white bread, sugary drinks" : "Processed foods, fast food, sugary drinks",
      lifestyleTips: "Exercise 30 minutes daily. Sleep 7-8 hours. Eat slowly and mindfully."
    }
  }
  
  const dietPlan = await prisma.dietPlan.create({
    data: {
      userId: user.id,
      calories: planData.calories || calories,
      breakfast: planData.breakfast,
      morningSnack: planData.morningSnack || "Healthy snack",
      lunch: planData.lunch,
      eveningSnack: planData.eveningSnack || "Light snack",
      dinner: planData.dinner,
      hydration: planData.hydration || "Stay hydrated",
      foodsToAvoid: planData.foodsToAvoid || "",
      lifestyleTips: planData.lifestyleTips || "",
    }
  })
  
  return NextResponse.json({ dietPlan })
}