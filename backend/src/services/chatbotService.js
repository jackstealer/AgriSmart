import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const guidance = [
  {
    keywords: ["water", "irrigation"],
    reply: "Use moisture-based irrigation scheduling and avoid overwatering during high humidity days.",
  },
  {
    keywords: ["price", "sell", "market"],
    reply: "Check predicted price trend and split your sale into batches instead of selling the full stock at once.",
  },
  {
    keywords: ["disease", "leaf", "pest"],
    reply: "Upload a clear crop image to disease detection and isolate infected patches before treatment.",
  },
  {
    keywords: ["weather", "rain", "wind"],
    reply: "Review current weather risk before spraying or harvesting to avoid quality loss.",
  },
];

const languageNames = {
  en: "English",
  hi: "Hindi (हिंदी)",
  mr: "Marathi (मराठी)",
  pa: "Punjabi (ਪੰਜਾਬੀ)",
  ta: "Tamil (தமிழ்)",
  te: "Telugu (తెలుగు)"
};

export const generateChatbotReply = async ({ message, user, language = 'en' }) => {
  try {
    // Use Groq AI for intelligent responses
    const languageName = languageNames[language] || "English";
    const systemPrompt = `You are an expert agricultural advisor for Indian farmers. 
You provide practical, actionable advice about farming, crops, weather, diseases, and market prices.
Keep responses concise (2-3 sentences), friendly, and easy to understand.
Respond in ${languageName}.
If the user asks in a specific language, respond in that same language.`;

    const userPrompt = `Farmer's question: ${message}

Provide helpful farming advice. If they ask about:
- Diseases: Suggest using the disease detection feature
- Prices: Mention the price prediction tool
- Weather: Recommend checking weather insights
- General farming: Give practical tips

Keep it brief and actionable.`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const reply = response.choices[0].message.content;
    return { reply, source: "groq-ai" };

  } catch (error) {
    console.error("Groq AI error:", error.message);
    
    // Fallback to rule-based if AI fails
    const normalized = String(message || "").toLowerCase();
    const match = guidance.find((item) => item.keywords.some((word) => normalized.includes(word)));

    if (match) {
      return { reply: match.reply, source: "rule-based" };
    }

    return {
      reply: "Share crop, location, and issue details. I can guide irrigation, disease checks, pricing, and weather actions.",
      source: "rule-based",
    };
  }
};
