import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Sparkles, 
  User,
  Bot,
  ThumbsUp,
  ThumbsDown,
  Dumbbell,
  Moon,
  Brain,
  MessageCircle
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const contextOptions = [
  { value: "general", label: "General", icon: MessageCircle },
  { value: "workout", label: "Fitness", icon: Dumbbell },
  { value: "sleep", label: "Sleep", icon: Moon },
  { value: "meditation", label: "Mindfulness", icon: Brain }
];

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState("general");
  const [chatHistory, setChatHistory] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatHistory = async () => {
    try {
      const response = await axios.get(`${API}/chat/history?limit=10`);
      setChatHistory(response.data);
      
      // Convert history to messages format
      const historyMessages = response.data.reverse().flatMap(item => [
        { role: "user", content: item.user_message },
        { role: "assistant", content: item.assistant_response, evaluation: item.evaluation, trace_id: item.trace_id }
      ]);
      setMessages(historyMessages);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await axios.post(`${API}/chat`, {
        message: userMessage,
        context: context
      });

      setMessages(prev => [...prev, {
        role: "assistant",
        content: response.data.response,
        evaluation: response.data.evaluation,
        trace_id: response.data.trace_id
      }]);
    } catch (error) {
      toast.error("Failed to get response");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (traceId, score) => {
    try {
      await axios.post(`${API}/opik/feedback?trace_id=${traceId}&score=${score}`);
      toast.success("Feedback submitted!");
    } catch (error) {
      toast.error("Failed to submit feedback");
    }
  };

  const getContextIcon = (ctx) => {
    const option = contextOptions.find(o => o.value === ctx);
    return option ? option.icon : MessageCircle;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[calc(100vh-12rem)] flex flex-col"
      data-testid="chat-page"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-medium">AI Wellness Coach</h1>
          <p className="text-muted-foreground mt-1">Get personalized guidance with Opik-evaluated responses</p>
        </div>
        
        {/* Context Tabs */}
        <Tabs value={context} onValueChange={setContext} className="w-full md:w-auto">
          <TabsList className="glass-card border-white/5 p-1 rounded-2xl">
            {contextOptions.map((option) => (
              <TabsTrigger 
                key={option.value} 
                value={option.value}
                className="rounded-xl px-4 py-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                data-testid={`context-tab-${option.value}`}
              >
                <option.icon className="w-4 h-4 mr-2" />
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Chat Container */}
      <Card className="glass-card rounded-3xl border-white/5 flex-1 flex flex-col overflow-hidden">
        {/* Messages Area */}
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-medium">Welcome to your AI Coach</h3>
                <p className="text-muted-foreground max-w-md">
                  Ask me anything about fitness, sleep, meditation, or general wellness. 
                  I'm here to help you achieve your health goals!
                </p>
                <div className="flex flex-wrap justify-center gap-2 pt-4">
                  {["How can I improve my sleep?", "Suggest a quick workout", "Help me reduce stress"].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      className="rounded-full border-white/10 hover:bg-white/5"
                      onClick={() => setInput(suggestion)}
                      data-testid={`suggestion-${suggestion.slice(0, 10)}`}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === "user" 
                        ? "bg-primary/20" 
                        : "bg-gradient-to-br from-accent/20 to-secondary/20"
                    }`}>
                      {message.role === "user" ? (
                        <User className="w-4 h-4 text-primary" />
                      ) : (
                        <Bot className="w-4 h-4 text-accent" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className={`rounded-2xl px-4 py-3 ${
                        message.role === "user" 
                          ? "bg-primary/20 rounded-tr-sm" 
                          : "bg-card border border-white/5 rounded-tl-sm"
                      }`} data-testid={`message-${index}`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </div>
                      
                      {/* Evaluation Badge & Feedback */}
                      {message.role === "assistant" && message.evaluation && (
                        <div className="flex items-center gap-2 px-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            message.evaluation.overall_quality >= 7 
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-amber-500/20 text-amber-400"
                          }`}>
                            Quality: {message.evaluation.overall_quality?.toFixed(1)}
                          </span>
                          {message.evaluation.safety_passed && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                              Safe
                            </span>
                          )}
                          {message.trace_id && (
                            <div className="flex items-center gap-1 ml-auto">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 hover:bg-emerald-500/20"
                                onClick={() => handleFeedback(message.trace_id, 1)}
                                data-testid={`feedback-up-${index}`}
                              >
                                <ThumbsUp className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 hover:bg-red-500/20"
                                onClick={() => handleFeedback(message.trace_id, 0)}
                                data-testid={`feedback-down-${index}`}
                              >
                                <ThumbsDown className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/20 to-secondary/20 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-accent" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm bg-card border border-white/5 px-4 py-3">
                      <div className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input Area */}
        <div className="p-4 border-t border-white/5">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask about ${context === "general" ? "wellness" : context}...`}
              className="flex-1 rounded-2xl bg-white/5 border-white/10 h-12"
              disabled={loading}
              data-testid="chat-input"
            />
            <Button 
              type="submit" 
              disabled={loading || !input.trim()}
              className="rounded-2xl h-12 px-6 glow-primary"
              data-testid="send-message-btn"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Responses are AI-generated and evaluated by Opik. Always consult healthcare professionals for medical advice.
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
