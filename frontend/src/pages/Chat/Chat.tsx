import React, { useState, useRef, useEffect } from "react";
import { FiSend, FiPaperclip, FiArrowLeft, FiMoreVertical, FiLayers, FiFileText, FiCheckCircle, FiDownload } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useChat } from "../../hooks/useChat";
import Sidebar from "../StudentDashboard/components/Sidebar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { messages, isStreaming, sendMessage, setMessages, loadSession, setSessionId, sessionId } = useChat();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gradingFiredRef = useRef<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-fire grading request ONCE when arriving from quiz modal.
  useEffect(() => {
    const state = location.state as any;
    const gradeRequest = state?.gradeRequest;
    
    if (!gradeRequest?.quiz_id) return;

    // StrictMode double-mount guard: check if we already fired for THIS mount cycle
    if (gradingFiredRef.current === gradeRequest.quiz_id) return;
    gradingFiredRef.current = gradeRequest.quiz_id;

    // 1. Clear Router State: prevents replay on back-navigation
    navigate(location.pathname, { replace: true, state: null });

    // 2. Clear Session State: ensures a fresh chat for every test attempt
    setMessages([]);
    setSessionId(null);

    const msg =
      `Please grade my answers for the test "${gradeRequest.quiz_title}":\n\n` +
      gradeRequest.test_submission
        .map((s: any, i: number) =>
          `Q${i + 1}. ${s.question}\nMy Answer: ${s.answer || '(no answer provided)'}`
        )
        .join('\n\n');

    // 3. Fire Request: explicitly set session_id to null to force create_session
    sendMessage({
      message: msg,
      grade_test: true,
      quiz_id: gradeRequest.quiz_id,
      session_id: null,
      test_submission: gradeRequest.test_submission,
      grading_instructions: gradeRequest.grading_instructions,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

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
        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
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
                  {msg.type && (
                    <div className="mt-4 grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      {msg.type === 'flashcards' && (
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-xl flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                              <FiLayers className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Flashcards Ready</span>
                              <div className="text-sm text-gray-600 dark:text-slate-300">
                                {msg.data.length} new cards generated.
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => navigate(msg.record_id ? `/flashcards?set_id=${msg.record_id}` : '/flashcards')}
                            className="px-4 py-2 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-all shadow-sm"
                          >
                            View Cards
                          </button>
                        </div>
                      )}

                      {(msg.type === 'mock_test' || msg.type === 'mcq_test') && (
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 rounded-xl flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                              <FiFileText className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                {msg.type === 'mock_test' ? 'Mock Test Ready' : 'MCQ Quiz Ready'}
                              </span>
                              <div className="text-sm text-gray-600 dark:text-slate-300">
                                {msg.data.length || 0} questions generated.
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => navigate(msg.record_id ? `/mock-tests?quiz_id=${msg.record_id}` : '/mock-tests')}
                            className="px-4 py-2 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 transition-all shadow-sm"
                          >
                            Start Test
                          </button>
                        </div>
                      )}

                      {msg.type === 'mock_test_grades' && msg.data && (
                        <div className="mt-3 space-y-3">
                          {/* Score header */}
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-xl">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 ${
                                  msg.data.total_marks / msg.data.max_total_marks >= 0.7
                                    ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
                                }`}>
                                  {msg.data.max_total_marks > 0
                                    ? Math.round((msg.data.total_marks / msg.data.max_total_marks) * 100)
                                    : 0}%
                                </div>
                                <div>
                                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Grading Complete</span>
                                  <div className="text-sm font-semibold text-gray-800 dark:text-white mt-0.5">
                                    {msg.data.total_marks} / {msg.data.max_total_marks} marks
                                  </div>
                                </div>
                              </div>
                              <FiCheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                            </div>
                            {msg.data.overall_feedback && (
                              <p className="mt-3 text-xs text-gray-600 dark:text-slate-300 leading-relaxed border-t border-blue-100 dark:border-blue-800 pt-3">
                                {msg.data.overall_feedback}
                              </p>
                            )}
                          </div>
                          {/* Per-question breakdown */}
                          {msg.data.grades && msg.data.grades.length > 0 && (
                            <div className="space-y-2">
                              {msg.data.grades.map((g: any, gi: number) => {
                                const pct = g.max_marks > 0 ? g.marks / g.max_marks : 0;
                                const isGood = pct >= 0.7;
                                return (
                                  <div
                                    key={gi}
                                    className={`p-3 rounded-xl border text-xs ${
                                      isGood
                                        ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20'
                                        : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                      <p className="font-semibold text-gray-800 dark:text-white">
                                        Q{gi + 1}. {g.question}
                                      </p>
                                      <span className={`font-bold flex-shrink-0 ${
                                        isGood ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                                      }`}>
                                        {g.marks}/{g.max_marks}
                                      </span>
                                    </div>
                                    {g.student_answer && (
                                      <p className="text-gray-500 dark:text-slate-400 mb-1">
                                        <span className="font-medium">Your answer:</span> {g.student_answer}
                                      </p>
                                    )}
                                    {g.correct_answer && (
                                      <p className="text-emerald-700 dark:text-emerald-400 mb-1">
                                        <span className="font-medium">Correct answer:</span> {g.correct_answer}
                                      </p>
                                    )}
                                    {g.feedback && (
                                      <p className="text-gray-600 dark:text-slate-300 italic">{g.feedback}</p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {msg.type === 'document' && (
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 rounded-xl flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-600 flex items-center justify-center text-white">
                              <FiDownload className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">PDF Export Ready</span>
                              <div className="text-sm text-gray-600 dark:text-slate-300 truncate max-w-[150px]">
                                {msg.data.filename || 'exported_document.pdf'}
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              const linkSource = `data:${msg.data.mime_type};base64,${msg.data.file_base64}`;
                              const downloadLink = document.createElement("a");
                              downloadLink.href = linkSource;
                              downloadLink.download = msg.data.filename;
                              downloadLink.click();
                            }}
                            className="px-4 py-2 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-lg hover:bg-amber-600 hover:text-white dark:hover:bg-amber-600 transition-all shadow-sm"
                          >
                            Download
                          </button>
                        </div>
                      )}
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
