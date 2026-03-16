// ── Shared prompt & parsing ──────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a compassionate habit coach helping people break habits into small, manageable micro-steps.
Your users may have executive dysfunction, ADHD, depression, or simply struggle with motivation.

Rules:
- Break habits into very small, concrete physical actions (not vague goals)
- Each step should take 1-3 minutes max
- Use gentle, encouraging language
- Steps should be sequential — each naturally leads to the next
- Include sensory anchors when helpful (e.g. "Feel the warm water on your hands")
- Respond ONLY with valid JSON, no markdown or explanation outside the JSON`;

function buildGeneratePrompt({ habitName, userContext, schedule }) {
  return `Break down the habit "${habitName}" into small, manageable micro-steps.
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
}

function buildUpdatePrompt({ habitName, currentSteps, userContext, schedule }) {
  return `I have a habit "${habitName}" with these current steps:
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
}

function parseJsonResponse(text) {
  try {
    // Strip markdown code fences (```json ... ```) that Gemini often adds
    const stripped = text.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '');
    const jsonMatch = stripped.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : stripped);
  } catch {
    throw new Error('Failed to parse AI response. Please try again.');
  }
}

// ── Claude provider ─────────────────────────────────────────────────────────

const CLAUDE_MODEL = 'claude-sonnet-4-20250514'; // Claude Sonnet 4.6

async function callClaude(apiKey, userPrompt) {
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
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Claude API error ${res.status}`);
  }

  const data = await res.json();
  return data.content[0].text;
}

// ── Gemini provider ─────────────────────────────────────────────────────────

const GEMINI_MODEL = 'gemini-2.5-flash';

async function callGemini(apiKey, userPrompt) {
  const res = await fetch(
    `/api/gemini/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: { maxOutputTokens: 8192 },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err.error?.message || `Gemini API error ${res.status}`
    );
  }

  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

// ── Router ──────────────────────────────────────────────────────────────────

function getProvider(provider) {
  if (provider === 'gemini') return callGemini;
  return callClaude;
}

// ── Public API ──────────────────────────────────────────────────────────────

export async function generateSteps(apiKey, provider, params) {
  const call = getProvider(provider);
  const prompt = buildGeneratePrompt(params);
  const text = await call(apiKey, prompt);
  return parseJsonResponse(text);
}

export async function updateSteps(apiKey, provider, params) {
  const call = getProvider(provider);
  const prompt = buildUpdatePrompt(params);
  const text = await call(apiKey, prompt);
  return parseJsonResponse(text);
}
