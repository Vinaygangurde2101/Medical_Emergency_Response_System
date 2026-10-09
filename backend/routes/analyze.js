const express = require('express');
const router = express.Router();
const multer = require('multer');
let GoogleGenAI = null;
try {
  GoogleGenAI = require('@google/genai').GoogleGenAI;
} catch (e) {
  try {
    GoogleGenAI = require('@google/generative-ai').GoogleGenerativeAI;
  } catch (e2) {}
}

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', upload.single('report'), async (req, res) => {
  try {
    const file = req.file;
    const language = req.body.language || 'en';

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, message: 'GEMINI_API_KEY is not configured.' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    let languagePrompt = "English";
    if (language === 'hi') languagePrompt = "Hindi";
    if (language === 'mr') languagePrompt = "Marathi";

    const prompt = `
You are a highly experienced and compassionate medical professional.
Analyze the provided medical report and generate a patient-friendly summary.
Please provide your response in ${languagePrompt} language only.

Structure your response using the following JSON format:
{
  "summary": "A high-level, easy-to-understand summary of the report.",
  "keyFindings": ["Point 1", "Point 2", "Point 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "disclaimer": "A brief medical disclaimer that this is AI-generated and not a substitute for professional medical advice."
}
Return only valid JSON, without Markdown block quotes or additional text.
`;

    // Process file to base64
    const base64Data = file.buffer.toString('base64');
    
    // Support common image types and PDFs
    const mimeType = file.mimetype;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: "OBJECT",
          properties: {
            summary: { type: "STRING", description: "A high-level, easy-to-understand summary of the report." },
            keyFindings: { type: "ARRAY", items: { type: "STRING" }, description: "List of key findings from the report." },
            recommendations: { type: "ARRAY", items: { type: "STRING" }, description: "List of recommendations based on the findings." },
            disclaimer: { type: "STRING", description: "A brief medical disclaimer that this is AI-generated and not a substitute for professional medical advice." }
          },
          required: ["summary", "keyFindings", "recommendations", "disclaimer"]
        }
      }
    });

    const resultText = response.text;
    
    // Clean up potential markdown formatting (```json ... ```)
    const cleanedText = resultText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const jsonResult = JSON.parse(cleanedText);

    res.json({
      success: true,
      data: jsonResult
    });

  } catch (error) {
    console.error('Error analyzing report:', error);
    res.status(500).json({ success: false, message: 'Failed to analyze report', error: error.message });
  }
});

module.exports = router;
