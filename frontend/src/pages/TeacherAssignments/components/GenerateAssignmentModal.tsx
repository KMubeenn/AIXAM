import React, { useState } from "react";
import { LuX, LuUpload, LuLoader, LuSparkles } from "react-icons/lu";
import { ChatService } from "../../../services/chat.service";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const GenerateAssignmentModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [assignmentTitle, setAssignmentTitle] = useState<string>("");
  const [totalMarks, setTotalMarks] = useState<number>(100);
  const [additionalInstructions, setAdditionalInstructions] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!file) {
      toast.error("Please upload a source material first.");
      return;
    }
    if (totalMarks <= 0) {
      toast.error("Please specify a valid total mark.");
      return;
    }

    setIsGenerating(true);
    try {
      let message = `Generate a structured Assignment worth ${totalMarks} marks based on the uploaded material: ${file.name}.`;
      if (assignmentTitle.trim()) {
        message += ` Title should be: ${assignmentTitle.trim()}.`;
      }
      if (additionalInstructions.trim()) {
        message += ` Additional Guidelines: ${additionalInstructions.trim()}`;
      }

      await ChatService.sendMessageStream(
        {
          message: message,
          direct_task: "assignment",
          create_session: true,
          files: [file],
        },
        (token) => {},
        (structuredData) => {},
        (sessionId) => {}
      );
      
      // Invalidate query to refresh teacher assignments list
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      onClose();
      toast.success("Assignment generated successfully!");
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
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-650 dark:text-indigo-400">
              <LuSparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Generate Assignment with AI</h2>
              <p className="text-xs text-gray-500 dark:text-slate-400">Create an assignment directly from material</p>
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
            <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:border-indigo-450 transition-all cursor-pointer">
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept=".pdf,.docx,.pptx,.txt"
              />
              <LuUpload className="w-8 h-8 text-indigo-500 mb-2" />
              {file ? (
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-450 truncate w-full text-center">{file.name}</span>
              ) : (
                <span className="text-sm text-gray-500 dark:text-slate-400">Click to upload (PDF, DOCX, PPTX, TXT)</span>
              )}
            </div>
          </div>

          {/* Title Override */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-350 uppercase tracking-wider mb-2">Assignment Title (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g., midterm review, lab 4, etc."
              value={assignmentTitle} 
              onChange={(e) => setAssignmentTitle(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-gray-900 dark:text-white"
            />
          </div>

          {/* Configuration */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-350 uppercase tracking-wider mb-2">Total Marks</label>
            <input 
              type="number" 
              min={1} 
              max={1000} 
              value={totalMarks === 0 ? "" : totalMarks} 
              onChange={(e) => {
                const val = e.target.value;
                if (val === "") {
                  setTotalMarks(0);
                } else {
                  let num = parseInt(val);
                  if (num > 1000) num = 1000;
                  setTotalMarks(num);
                }
              }}
              className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-gray-900 dark:text-white"
            />
          </div>

          {/* Guidelines */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-350 uppercase tracking-wider mb-2">Additional Instructions</label>
            <textarea
              placeholder="e.g., Focus on coding tasks, require rubric for each task, limit difficulty..."
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value)}
              rows={3}
              className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-gray-900 dark:text-white resize-none"
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
            disabled={isGenerating || !file || totalMarks <= 0}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {isGenerating ? (
              <><LuLoader className="w-4 h-4 animate-spin" /> Generating...</>
            ) : (
              "Generate Assignment"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateAssignmentModal;
