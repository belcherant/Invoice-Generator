// ai.js

const HUGGING_FACE_API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn";
const HUGGING_FACE_API_KEY = "your_hugging_face_api_key"; // Store securely in production

/**
 * Sends text to Hugging Face for summarization
 * @param {string} inputText - The text to summarize
 * @returns {Promise<string>} - The summarized text
 */
async function summarizeText(inputText) {
  try {
    const response = await fetch(HUGGING_FACE_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HUGGING_FACE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: inputText })
    });

    const result = await response.json();
    return result[0]?.summary_text || "No summary returned.";
  } catch (error) {
    console.error("AI summarization error:", error);
    return "Error summarizing text.";
  }
}
