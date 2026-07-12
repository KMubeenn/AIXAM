import React, { useState } from "react";
import { LuX, LuUpload, LuLoader, LuSparkles } from "react-icons/lu";
import { ChatService } from "../../../services/chat.service";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const GenerateQuizModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [quizType, setQuizType] = useState<"mcq" | "descriptive">("mcq");
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [pointsPerQuestion, setPointsPerQuestion] = useState<number>(1);
  const [additionalInstructions, setAdditionalInstructions] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!file) {
      toast.error("Please upload a source material first.");
      return;
    }
    if (questionCount <= 0) {
      toast.error("Please specify a valid number of questions.");
      return;
    }

    setIsGenerating(true);
    try {
      let message = `Generate a ${quizType.toUpperCase()} quiz with ${questionCount} questions based on the uploaded material: ${file.name}.`;
      if (pointsPerQuestion !== 1) {
        message += ` Each question should be worth ${pointsPerQuestion} points.`;
      }
      if (additionalInstructions.trim()) {
        message += ` Additional Guidelines: ${additionalInstructions.trim()}`;
      }

      await ChatService.sendMessageStream(
        {
          message: message,
          direct_task: "quiz",
          create_session: true,
          files: [file],
        },
        (token) => {},
        (structuredData) => {},
        (sessionId) => {}
      );
      
      // Invalidate query to refresh teacher quizzes list
      queryClient.invalidateQueries({ queryKey: ['teacher-quizzes'] });
      onClose();
      toast.success("Quiz generated successfully!");
    } catch (e: any) {
      toast.error(e.message || "Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <LuSparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Generate Quiz with AI</h2>
              <p className="text-xs text-gray-500 dark:text-slate-400">Create a quiz directly from material</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
            <LuX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
          {/* File Upload */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-350 uppercase tracking-wider mb-2">Upload Source Material</label>
            <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:border-blue-400 transition-all cursor-pointer">
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept=".pdf,.docx,.pptx,.txt"
              />
              <LuUpload className="w-8 h-8 text-blue-500 mb-2" />
              {file ? (
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-450 truncate w-full text-center">{file.name}</span>
              ) : (
                <span className="text-sm text-gray-500 dark:text-slate-400">Click to upload (PDF, DOCX, PPTX, TXT)</span>
              )}
            </div>
          </div>

          {/* Quiz Type */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-350 uppercase tracking-wider mb-2">Quiz Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setQuizType("mcq")}
                className={`py-2 px-4 rounded-xl text-sm font-medium border transition-all ${
                  quizType === "mcq" 
                    ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300" 
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                Multiple Choice
              </button>
              <button
                type="button"
                onClick={() => setQuizType("descriptive")}
                className={`py-2 px-4 rounded-xl text-sm font-medium border transition-all ${
                  quizType === "descriptive" 
                    ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300" 
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                Descriptive / Short Answer
              </button>
            </div>
          </div>

          {/* Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-350 uppercase tracking-wider mb-2">Questions count</label>
              <input 
                type="number" 
                min={1} 
                max={50} 
                value={questionCount === 0 ? "" : questionCount} 
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    setQuestionCount(0);
                  } else {
                    let num = parseInt(val);
                    if (num > 50) num = 50;
                    setQuestionCount(num);
                  }
                }}
                className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-350 uppercase tracking-wider mb-2">Points per question</label>
              <input 
                type="number" 
                min={1} 
                max={100} 
                value={pointsPerQuestion === 0 ? "" : pointsPerQuestion} 
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    setPointsPerQuestion(0);
                  } else {
                    let num = parseInt(val);
                    if (num > 100) num = 100;
                    setPointsPerQuestion(num);
                  }
                }}
                className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Guidelines */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-350 uppercase tracking-wider mb-2">Additional Instructions</label>
            <textarea
              placeholder="e.g., Focus on Transformers structure, hard level, include specific topics..."
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value)}
              rows={3}
              className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-900 dark:text-white resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3 bg-gray-50 dark:bg-slate-800/30">
          <button 
            type="button"
            onClick={onClose} 
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleGenerate} 
            disabled={isGenerating || !file || questionCount <= 0}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {isGenerating ? (
              <><LuLoader className="w-4 h-4 animate-spin" /> Generating...</>
            ) : (
              "Generate Quiz"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateQuizModal;
