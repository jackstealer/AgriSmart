import { generateChatbotReply } from "../services/chatbotService.js";

export const askChatbot = async (req, res) => {
  try {
    const { message, language } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ success: false, message: "message is required" });
    }

    const response = await generateChatbotReply({
      message,
      language: language || 'en',
      user: {
        id: req.user.id,
        role: req.user.role,
      },
    });

    res.json({ success: true, data: response });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
