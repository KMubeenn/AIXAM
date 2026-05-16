import React, { useState, useRef, useEffect } from "react";
import { FiSend, FiPaperclip, FiArrowLeft, FiMoreVertical } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useChat } from "../../hooks/useChat";
import Sidebar from "../StudentDashboard/components/Sidebar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const { messages, isStreaming, sendMessage, setMessages, loadSession, setSessionId } = useChat();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage({ message: input });
    setInput("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      sendMessage({ message: `I've uploaded a file: ${files[0].name}`, files: Array.from(files) });
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setSessionId(null);
  };

  const handleSessionSelect = (id: string) => {
    loadSession(id);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950">
      <Sidebar onSessionSelect={handleSessionSelect} onNewChat={handleNewChat} />
      <main className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-500 transition-colors lg:hidden"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                AI
              </div>
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white leading-none">AI Study Agent</h2>
                <span className="text-xs text-green-500 font-medium flex items-center gap-1 mt-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  Online & Ready
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-500 transition-colors">
              <FiMoreVertical className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-slate-800">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
              <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                <FiSend className="w-10 h-10 rotate-12" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Start a New Study Session</h3>
              <p className="max-w-xs text-gray-500 dark:text-slate-400">
                Ask me to explain concepts, generate flashcards, or create mock tests from your materials.
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg' 
                      : 'bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 rounded-tl-none border border-gray-100 dark:border-slate-800 shadow-sm'
                  }`}
                >
                  <div className="markdown-content">
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                    )}
                  </div>
                  
                  {/* Structured Data Visualization */}
                  {msg.type === 'flashcards' && (
                    <div className="mt-4 grid grid-cols-1 gap-3">
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-xl">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">New Flashcards Generated</span>
                        <div className="mt-2 text-sm text-gray-600 dark:text-slate-300">
                          Click to view {msg.data.length} new cards.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <footer className="p-6 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800">
          <div className="max-w-4xl mx-auto relative">
            <input 
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              multiple
            />
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-950 p-2 rounded-2xl border border-gray-200 dark:border-slate-800 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <FiPaperclip className="w-5 h-5" />
              </button>
              <textarea 
                rows={1}
                placeholder="Ask anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white py-3 resize-none outline-none"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className={`p-3 rounded-xl transition-all ${
                  input.trim() && !isStreaming 
                    ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700' 
                    : 'bg-gray-200 dark:bg-slate-800 text-gray-400 cursor-not-allowed'
                }`}
              >
                <FiSend className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-3 text-center">
              <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-widest font-medium">
                AI may generate inaccurate information. Use with caution.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Chat;
