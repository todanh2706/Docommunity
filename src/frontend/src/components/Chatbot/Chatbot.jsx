import { useState, useEffect, useRef } from 'react';
import { IoChatbubbleEllipsesOutline, IoClose, IoSend } from "react-icons/io5";
import { TypeAnimation } from 'react-type-animation';
import { getAiChat } from '../../services/AIService';

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! How can I assist you today?", sender: "bot" }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const observer = new MutationObserver(() => {
            scrollToBottom();
        });

        if (chatContainerRef.current) {
            observer.observe(chatContainerRef.current, {
                childList: true,
                subtree: true,
                characterData: true
            });
        }

        return () => observer.disconnect();
    }, []);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isTyping) return;

        const newMessage = {
            id: Date.now(),
            text: inputValue,
            sender: "user"
        };

        // 1. Add user message immediately
        setMessages(prev => [...prev, newMessage]);
        setInputValue("");
        setIsTyping(true);

        try {
            // 2. Call Real API
            const data = await getAiChat(newMessage.text);

            // Backend returns { reply: "..." }
            const botReply = data.reply || "I didn't get a response.";

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: botReply,
                sender: "bot"
            }]);

        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "Sorry, I'm having trouble connecting to the server right now.",
                sender: "bot"
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-8 right-6 z-50 flex flex-col items-end font-sans pointer-events-none">
            {/* Chat Panel */}
            <div
                className={`
          transition-all duration-300 ease-in-out transform origin-bottom-right pointer-events-auto
          ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4 pointer-events-none'}
          w-80 sm:w-96 h-[500px] mb-4
          bg-slate-900/80 backdrop-blur-md border border-white/10
          rounded-2xl shadow-2xl overflow-hidden flex flex-col
        `}
            >
                {/* Header */}
                <div className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                        <h3 className="text-white font-semibold tracking-wide">AI Assistant</h3>
                    </div>
                    <button
                        onClick={toggleChat}
                        className="text-white/70 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
                    >
                        <IoClose size={20} />
                    </button>
                </div>

                {/* Messages Area */}
                <div
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                >
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`
                  max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed
                  ${msg.sender === 'user'
                                        ? 'bg-cyan-600/80 text-white rounded-br-none'
                                        : 'bg-white/10 text-slate-200 rounded-bl-none border border-white/5'}
                `}
                            >
                                {msg.sender === 'bot' ? (
                                    <TypeAnimation
                                        sequence={[msg.text]}
                                        wrapper="span"
                                        speed={50}
                                        cursor={false}
                                    />
                                ) : (
                                    msg.text
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-4 bg-white/5 border-t border-white/10 backdrop-blur-sm">
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={isTyping ? "Bot is typing..." : "Type a message..."}
                            disabled={isTyping}
                            className={`w-full bg-slate-800/50 text-white text-sm rounded-full pl-4 pr-12 py-3 border border-white/10 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 placeholder-slate-400 transition-all ${isTyping ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                        <button
                            type="submit"
                            disabled={isTyping}
                            className={`absolute right-2 p-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-full transition-all shadow-lg shadow-cyan-500/20 ${isTyping ? 'opacity-50 cursor-not-allowed hover:bg-cyan-500' : ''}`}
                        >
                            <IoSend size={16} />
                        </button>
                    </div>
                </form>
            </div>

            {/* Toggle Button */}
            <button
                onClick={toggleChat}
                className={`
          group relative flex items-center justify-center w-12 h-12 rounded-full
          bg-gradient-to-br from-cyan-600 to-blue-700
          text-white shadow-lg shadow-cyan-900/40
          hover:shadow-cyan-500/40 hover:scale-110 transition-all duration-300
          border border-white/10 pointer-events-auto
          ${isOpen ? 'rotate-90 opacity-0 pointer-events-none absolute' : 'rotate-0 opacity-100'}
        `}
            >
                <div className="absolute inset-0 rounded-full bg-white/20 blur-md group-hover:blur-lg transition-all"></div>
                <IoChatbubbleEllipsesOutline size={28} className="relative z-10" />
            </button>

        </div>
    );
};
