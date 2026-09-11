const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: 'AIzaSyDS2sqLy_jZCJF5zcBUhOrg3KmXwX7A4jk' });

async function test() {
  try {
    const prompt = "Analyze this medical report.";
    const base64Data = Buffer.from("fake image data").toString('base64');
    
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
                mimeType: 'image/jpeg'
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
      }
    });
    console.log("Success!");
    console.log(response.text);
  } catch (error) {
    console.error("Error:", error);
  }
}
test();
