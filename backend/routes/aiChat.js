const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

// Emergency first-aid system instructions
const EMERGENCY_SYSTEM_PROMPT = `
You are MERS AI, an Emergency Medical First-Aid Assistant.
Your primary role is to provide quick, concise, step-by-step first aid guidance in high-stress emergency situations (e.g., CPR, severe bleeding, burns, choking, fainting, fractures, heat stroke).

STRICT RULES:
1. Always prioritize immediate safety and recommend calling emergency services (108 / 112) for severe conditions.
2. Structure responses in 3 to 5 clear, numbered, actionable steps.
3. Keep sentences short, urgent, direct, and easy to read on a mobile phone during an emergency.
4. Always end with a short medical disclaimer that you are an AI assistant and not a substitute for professional medical care.
5. DO NOT diagnose diseases or prescribe medications.
`;

// Fallback responses when Gemini key is not configured or offline
const fallbackGuide = (query = '') => {
  const q = query.toLowerCase();

  if (q.includes('cpr') || q.includes('heart') || q.includes('cardiac') || q.includes('pulse')) {
    return {
      text: `### 🚨 CPR Emergency Protocol
1. **Call 108 / 112 immediately** or ask someone nearby to call.
2. Place victim flat on their back on a firm surface.
3. Push hard and fast in the center of the chest (100–120 compressions/min).
4. Allow chest to recoil completely between compressions.
5. Continue until emergency medical help arrives.`,
      disclaimer: "⚠️ AI Emergency Guide. Always summon professional medical help immediately."
    };
  }

  if (q.includes('bleed') || q.includes('blood') || q.includes('cut') || q.includes('wound')) {
    return {
      text: `### 🩸 Severe Bleeding Response
1. Apply firm, continuous direct pressure to the wound with a clean cloth or bandage.
2. Keep the injured area elevated above heart level if possible.
3. Do NOT remove soaked bandages; add more layers over them.
4. If bleeding is uncontrolled, apply a tourniquet above the wound (arms/legs only).
5. Call 108 emergency services immediately.`,
      disclaimer: "⚠️ AI Emergency Guide. Seek immediate trauma care."
    };
  }

  if (q.includes('chok') || q.includes('airway') || q.includes('cough')) {
    return {
      text: `### 🫁 Choking First-Aid Protocol
1. If person can cough or speak, encourage them to keep coughing.
2. If unable to breathe or speak, give 5 sharp back blows between shoulder blades.
3. Perform Heimlich Maneuver: Stand behind them, wrap arms around waist, make a fist above navel, and pull inward & upward fast.
4. Repeat 5 back blows and 5 abdominal thrusts until object clears.
5. Call 108 if victim loses consciousness.`,
      disclaimer: "⚠️ AI Emergency Guide. Call 108 immediately if airway remains blocked."
    };
  }

  if (q.includes('burn') || q.includes('fire') || q.includes('scald')) {
    return {
      text: `### 🔥 Burn Injury Treatment
1. Immediately cool the burn under cool running water for at least 10–20 minutes.
2. Remove clothing around burn UNLESS stuck to the burned skin.
3. Cover burn loosely with clean plastic wrap or a sterile non-stick bandage.
4. Do NOT pop blisters or apply ice, butter, or ointments.
5. Seek immediate hospital care for deep or severe burns.`,
      disclaimer: "⚠️ AI Emergency Guide. Seek urgent medical attention for deep burns."
    };
  }

  return {
    text: `### 🩺 Emergency First-Aid Guidance
1. **Call 108 / 112** immediately for severe chest pain, shortness of breath, loss of consciousness, or major trauma.
2. Ensure the surroundings are safe for both you and the victim.
3. Keep the patient calm, still, and comfortable.
4. Check breathing and responsiveness.
5. Await emergency medical response.`,
    disclaimer: "⚠️ MERS AI Emergency Assistant. Always seek qualified medical care."
  };
};

// @route   POST api/ai/chat
router.post('/chat', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ msg: 'Emergency query required' });

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            {
              role: 'user',
              parts: [
                { text: `${EMERGENCY_SYSTEM_PROMPT}\n\nUSER EMERGENCY QUERY: ${query}` }
              ]
            }
          ]
        });

        const reply = response.text;
        return res.json({
          success: true,
          reply,
          source: 'gemini-2.5-flash'
        });
      } catch (geminiErr) {
        console.error('Gemini AI API Error, using emergency fallback:', geminiErr.message);
      }
    }

    // Fallback response
    const fallback = fallbackGuide(query);
    res.json({
      success: true,
      reply: `${fallback.text}\n\n*${fallback.disclaimer}*`,
      source: 'mers-firstaid-engine'
    });

  } catch (err) {
    console.error('AI chat route error:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
