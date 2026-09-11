const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: 'AIzaSyDS2sqLy_jZCJF5zcBUhOrg3KmXwX7A4jk' });

async function test() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Tell me a short medical joke.",
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
