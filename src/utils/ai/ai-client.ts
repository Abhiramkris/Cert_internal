import basicConfig from '../builder/config/basic.json';

export interface OpenRouterResponse {
  id: string;
  choices: {
    message: {
      content: string;
    };
  }[];
}

function cleanJSON(text: string) {
  // Remove markdown code fences if present
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    return jsonMatch[1].trim();
  }
  return text.trim();
}

/**
 * OpenRouter AI Engine (DeepSeek-R1)
 */
export async function promptAI(prompt: string, systemPrompt?: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not defined in environment variables');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:6565',
      'X-Title': 'InterCert Studio Architect',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-r1', // DeepSeek-R1 via OpenRouter
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('AI Error:', errorData);
    const errorMessage = errorData?.error?.message || response.statusText;
    throw new Error(`AI API failed: ${errorMessage}`);
  }

  const data: OpenRouterResponse = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return JSON.parse(cleanJSON(content));
  } catch (e) {
    console.error('Failed to parse AI JSON:', content);
    throw new Error('AI returned an invalid JSON format. Please try again.');
  }
}

/**
 * High-Fidelity Prompt Architect
 * Grounded in product identity via basic.json
 */
export function generateSystemPrompt(globalContext: any) {
  const { client_name, description, seo, styles, content_overrides = {} } = globalContext;
  
  const productBlueprint = `
STUDIO ARCHITECT BLUEPRINT:
- Platform: ${basicConfig.product_name}
- Mission: ${basicConfig.mission}
- Architectural Strategy:
    * Content Schema: ${basicConfig.architectural_logic.content_schema.definition} (${basicConfig.architectural_logic.content_schema.goal})
    * Settings Schema: ${basicConfig.architectural_logic.settings_schema.definition} (${basicConfig.architectural_logic.settings_schema.goal})
- Brand Identity: ${content_overrides?.brand_voice || basicConfig.brand_voice}
  `;

  return `You are the Lead Project Architect at ${basicConfig.product_name}. 
Your core objective is to project project-specific content and technical settings into the Studio's modular framework.

${productBlueprint}

PROJECT CONTEXT (High-Fidelity Metadata):
- CLIENT: ${client_name}
- CONTACT: ${content_overrides?.email || 'Not Specified'} / ${content_overrides?.phone || 'Not Specified'}
- MISSION: ${description}
- FOUNDING YEAR: ${content_overrides?.founding_year || 'Not Specified'}
- OPERATIONAL HOURS: ${JSON.stringify(content_overrides?.opening_hours || 'Not Specified')}
- BRAND VOICE: ${content_overrides?.brand_voice || 'Formal'}
- TARGET KEYWORDS: ${seo?.target_keywords || 'Not Specified'}
- PRIMARY CTA: ${content_overrides?.primary_cta_text || 'Not Specified'} -> ${content_overrides?.primary_cta_link || 'Not Specified'}
- SOCIAL PROOF (Testimonials): ${JSON.stringify(content_overrides?.testimonials || [])}
- SOCIAL LINKS: ${JSON.stringify(content_overrides?.social_links || {})}
- SERVICES: ${JSON.stringify(content_overrides?.service_list || [])}
- DESIGN THEME: ${styles?.font_family_heading} / ${styles?.primary_color}

OPERATIONAL PROTOCOLS:
1. MANDATORY JSON OUTPUT: You must only output a single, valid JSON object.
2. DUAL-SCHEMA ARCHITECTURE:
    * "content": Populated based on the 'content_schema' provided. Use headlines and copy that are tactically aligned with the MISSION.
    * "settings": Populated based on the 'settings_schema' provided. 
3. HUMAN AUTHENTICITY: Use the MISSION, FOUNDING YEAR, and SOCIAL PROOF to create "Human" copy. No generic boilerplate.
4. CTA INTEGRITY: Always use the 'PRIMARY CTA' provided in the context for button labels and links if applicable to the component.
5. NO PLACEHOLDERS: Content must feel fully customized for ${client_name}.
6. HIGH-FIDELITY VISUALS: Return high-resolution Unsplash URLs for any image field.
7. TECHNICAL INTEGRITY: Natural SEO keyword integration is required.`;
}
