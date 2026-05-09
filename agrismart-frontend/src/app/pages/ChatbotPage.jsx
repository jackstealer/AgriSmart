import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Bot, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { chatbotService } from '../services/api';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
export const ChatbotPage = () => {
    const { i18n } = useTranslation();
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim())
            return;
        const userMessage = {
            id: Date.now().toString(),
            role: 'user',
            message: inputMessage,
            timestamp: new Date().toLocaleString(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);
        try {
            const currentLanguage = i18n.language || 'en';
            const response = await chatbotService.ask(userMessage.message, currentLanguage);
            const reply = response.data?.data?.reply || 'No response available.';
            const aiResponse = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                message: reply,
                timestamp: new Date().toLocaleString(),
            };
            setMessages((prev) => [...prev, aiResponse]);
        }
        catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to get response');
        }
        finally {
            setIsTyping(false);
        }
    };
    const quickQuestions = [
        'What is the current weather forecast?',
        'Show me market prices',
        'How do I detect crop diseases?',
        'Best time to plant rice?',
    ];
    return (<div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Assistant</h1>
        <p className="text-muted-foreground">Get instant answers to your farming questions</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <Avatar className="bg-primary">
                  <AvatarFallback>
                    <Bot className="w-5 h-5"/>
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>AgriSmart AI</CardTitle>
                  <p className="text-sm text-muted-foreground">Online - Ready to help</p>
                </div>
              </div>
            </CardHeader>

            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg, index) => (<motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <Avatar className={msg.role === 'user' ? 'bg-blue-600' : 'bg-primary'}>
                      <AvatarFallback>
                        {msg.role === 'user' ? (<User className="w-5 h-5"/>) : (<Bot className="w-5 h-5"/>)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex-1 max-w-[80%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                      <div className={`inline-block p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <p className="text-sm">{msg.message}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{msg.timestamp}</p>
                    </div>
                  </motion.div>))}

                {isTyping && (<div className="flex gap-3">
                    <Avatar className="bg-primary">
                      <AvatarFallback>
                        <Bot className="w-5 h-5"/>
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"/>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"/>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"/>
                      </div>
                    </div>
                  </div>)}
              </div>
            </ScrollArea>

            <CardContent className="border-t p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input placeholder="Ask me anything about farming..." value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} disabled={isTyping}/>
                <Button type="submit" disabled={isTyping || !inputMessage.trim()}>
                  <Send className="w-4 h-4"/>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickQuestions.map((question, index) => (<Button key={index} variant="outline" className="w-full justify-start text-left h-auto py-3" onClick={() => setInputMessage(question)}>
                  {question}
                </Button>))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>);
};
