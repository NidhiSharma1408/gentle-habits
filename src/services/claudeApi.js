const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

async function callClaude(apiKey, messages, system) {
  const res = await fetch('/api/claude/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system,
      messages,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${res.status}`);
  }

  const data = await res.json();
  return data.content[0].text;
}

const SYSTEM_PROMPT = `You are a compassionate habit coach helping people break habits into small, manageable micro-steps.
Your users may have executive dysfunction, ADHD, depression, or simply struggle with motivation.

Rules:
- Break habits into very small, concrete physical actions (not vague goals)
- Each step should take 1-3 minutes max
- Use gentle, encouraging language
- Steps should be sequential — each naturally leads to the next
- Include sensory anchors when helpful (e.g. "Feel the warm water on your hands")
- Respond ONLY with valid JSON, no markdown or explanation outside the JSON`;

export async function generateSteps(apiKey, { habitName, userContext, schedule }) {
  const prompt = `Break down the habit "${habitName}" into small, manageable micro-steps.
${schedule ? `This habit is scheduled for: ${schedule}` : ''}
${userContext ? `Additional context from the user: ${userContext}` : ''}

Respond with JSON in this exact format:
{
  "steps": ["step 1 text", "step 2 text", ...],
  "altLabel": "a short label for an easier version",
  "altSteps": ["easy step 1", "easy step 2", ...]
}

The "steps" array should have 4-8 detailed micro-steps.
The "altSteps" array should have 2-3 simplified steps for low-energy days.`;

  const text = await callClaude(apiKey, [{ role: 'user', content: prompt }], SYSTEM_PROMPT);

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch {
    throw new Error('Failed to parse AI response. Please try again.');
  }
}

export async function updateSteps(apiKey, { habitName, currentSteps, userContext, schedule }) {
  const prompt = `I have a habit "${habitName}" with these current steps:
${currentSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

${schedule ? `This habit is scheduled for: ${schedule}` : ''}
The user wants to update these steps. Their feedback: ${userContext}

Respond with JSON in this exact format:
{
  "steps": ["step 1 text", "step 2 text", ...],
  "altLabel": "a short label for an easier version",
  "altSteps": ["easy step 1", "easy step 2", ...]
}

Keep what works, improve what doesn't, and apply the user's feedback.`;

  const text = await callClaude(apiKey, [{ role: 'user', content: prompt }], SYSTEM_PROMPT);

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch {
    throw new Error('Failed to parse AI response. Please try again.');
  }
}
