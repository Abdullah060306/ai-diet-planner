import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function generateDietPlan(profile: any) {
  const { age, gender, height, weight, healthConditions, fitnessGoal } = profile
  
  // Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
  let bmr: number
  if (gender === 'male') {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5
  } else {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161
  }

  // Adjust calories based on fitness goal
  let targetCalories: number
  if (fitnessGoal === 'weight-loss') {
    targetCalories = Math.round(bmr * 1.375 - 500)
  } else if (fitnessGoal === 'weight-gain') {
    targetCalories = Math.round(bmr * 1.375 + 500)
  } else {
    targetCalories = Math.round(bmr * 1.375)
  }

  // Health condition based modifications
  const foodsToAvoid: string[] = []
  const lifestyleTips: string[] = []

  if (healthConditions.includes('diabetes')) {
    foodsToAvoid.push('Sugar', 'White bread', 'Sugary drinks', 'Candy', 'White rice')
    lifestyleTips.push('Monitor blood sugar regularly', 'Eat small frequent meals', 'Choose low glycemic index foods')
  }
  if (healthConditions.includes('hypertension')) {
    foodsToAvoid.push('Salt', 'Processed foods', 'Canned soups', 'Pickles', 'Bacon')
    lifestyleTips.push('Limit sodium intake to 1500mg/day', 'Exercise regularly', 'Reduce stress')
  }
  if (healthConditions.includes('heart-disease')) {
    foodsToAvoid.push('Trans fats', 'Red meat', 'Fried foods', 'Full-fat dairy', 'Processed snacks')
    lifestyleTips.push('Eat omega-3 rich foods', 'Maintain healthy weight', 'Avoid smoking')
  }
  if (healthConditions.includes('high-cholesterol')) {
    foodsToAvoid.push('Egg yolks', 'Butter', 'Cheese', 'Processed meats', 'Coconut oil')
    lifestyleTips.push('Eat more fiber', 'Exercise 30 min daily', 'Eat nuts and seeds')
  }
  if (healthConditions.includes('kidney-disease')) {
    foodsToAvoid.push('High potassium foods', 'High phosphorus foods', 'Processed meats', 'Bananas')
    lifestyleTips.push('Monitor fluid intake', 'Control protein consumption', 'Regular checkups')
  }
  if (healthConditions.includes('thyroid')) {
    foodsToAvoid.push('Soy products', 'Cruciferous vegetables (raw)', 'Gluten', 'Processed soy')
    lifestyleTips.push('Take medication as prescribed', 'Get regular thyroid checkups', 'Manage stress')
  }
  if (healthConditions.includes('none') || healthConditions.length === 0) {
    foodsToAvoid.push('Excessive sugar', 'Processed junk food', 'Trans fats', 'Sugary beverages')
    lifestyleTips.push('Stay hydrated', 'Exercise regularly', 'Get adequate sleep', 'Eat whole foods')
  }

  // Generate meals based on calories
  const breakfast = targetCalories < 1800 
    ? 'Oatmeal with berries and almonds + Green tea (300 cal)'
    : targetCalories < 2500
    ? 'Whole wheat toast with avocado + Scrambled eggs + Fresh orange juice (500 cal)'
    : 'Pancakes with maple syrup + Bacon + Eggs + Banana smoothie (700 cal)'

  const morningSnack = targetCalories < 1800
    ? 'Apple slices with peanut butter (150 cal)'
    : 'Greek yogurt with granola and honey (250 cal)'

  const lunch = targetCalories < 1800
    ? 'Grilled chicken salad with olive oil dressing + Brown rice (450 cal)'
    : targetCalories < 2500
    ? 'Brown rice + Grilled salmon + Steamed broccoli + Side salad (700 cal)'
    : 'Pasta with meatballs + Garlic bread + Side salad + Soup (900 cal)'

  const eveningSnack = targetCalories < 1800
    ? 'Handful of almonds (100 cal)'
    : 'Protein shake with banana (200 cal)'

  const dinner = targetCalories < 1800
    ? 'Baked fish with quinoa and asparagus + Mixed vegetables (400 cal)'
    : targetCalories < 2500
    ? 'Lean beef stir-fry with vegetables + Brown rice + Soup (650 cal)'
    : 'Grilled steak + Mashed potatoes + Roasted vegetables + Dinner roll (850 cal)'

  const hydration = 'Drink at least 8 glasses (2-3 liters) of water daily. Increase intake during exercise and hot weather.'

  return {
    calories: targetCalories,
    breakfast,
    morningSnack,
    lunch,
    eveningSnack,
    dinner,
    hydration,
    foodsToAvoid,
    lifestyleTips,
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const dietPlanData = generateDietPlan(profile)

    const dietPlan = await prisma.dietPlan.create({
      data: {
        userId: session.user.id,
        ...dietPlanData,
      },
    })

    return NextResponse.json({ dietPlan }, { status: 200 })
  } catch (error) {
    console.error('Diet plan error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}