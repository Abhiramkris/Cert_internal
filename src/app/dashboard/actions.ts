'use server'

import { promptAI } from '@/utils/ai/ai-client'

export async function getAIGreeting(userName: string) {
  try {
    const aiResponse = await promptAI(
      `Generate a funky, high-end greeting for ${userName}. 
       It should be in a random language or use tech/hacker/premium lingo. 
       STRICT LIMIT: Exactly 4-5 words total.
       MANDATORY: Return ONLY a JSON object: { "greeting": "..." }. 
       No conversational text, no explanations.`,
      "You are a futuristic AI assistant for the Certifyied Intelligence Portal. Be creative, professional, and slightly mysterious.",
      50
    )
    return aiResponse?.greeting || null
  } catch (e) {
    console.error('AI Greeting action failed:', e)
    return null
  }
}
