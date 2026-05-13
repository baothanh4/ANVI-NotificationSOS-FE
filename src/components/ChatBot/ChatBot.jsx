import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { aiApi } from '../../api/aiApi';
import './ChatBot.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Xin chào! Tôi là trợ lý AI của ANVI-SOS. Tôi có thể giúp gì cho bạn về sơ cứu hoặc an toàn hôm nay?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await aiApi.chat(userMessage);
            setMessages(prev => [...prev, { role: 'assistant', content: response.response }]);
        } catch (error) {
            console.error('AI Error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`chatbot-container ${isOpen ? 'active' : ''}`}>
            {/* Chat Toggle Button */}
            <button 
                className="chatbot-toggle" 
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle Chatbot"
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
                {!isOpen && <span className="chatbot-badge">AI</span>}
            </button>

            {/* Chat Window */}
            <div className="chatbot-window">
                <div className="chatbot-header">
                    <div className="chatbot-header-info">
                        <div className="chatbot-avatar">
                            <Bot size={20} color="white" />
                        </div>
                        <div>
                            <h3>ANVI Assistant</h3>
                            <span className="status-online">Đang trực tuyến</span>
                        </div>
                    </div>
                    <button className="close-btn" onClick={() => setIsOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                <div className="chatbot-messages">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message-wrapper ${msg.role}`}>
                            <div className="message-icon">
                                {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
                            </div>
                            <div className="message-bubble">
                                {msg.role === 'assistant' ? (
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {msg.content}
                                    </ReactMarkdown>
                                ) : (
                                    msg.content
                                )}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="message-wrapper assistant">
                            <div className="message-icon">
                                <Bot size={14} />
                            </div>
                            <div className="message-bubble loading">
                                <Loader2 size={16} className="animate-spin" />
                                <span>Đang suy nghĩ...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form className="chatbot-input" onSubmit={handleSend}>
                    <input 
                        type="text" 
                        placeholder="Nhập câu hỏi của bạn..." 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={!input.trim() || isLoading}>
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};
