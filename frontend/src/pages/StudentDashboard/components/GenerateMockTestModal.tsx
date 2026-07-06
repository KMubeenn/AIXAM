import React, { useState } from "react";
import { LuX, LuUpload, LuLoader, LuFlaskConical } from "react-icons/lu";
import { ChatService } from "../../../services/chat.service";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const GenerateMockTestModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [testType, setTestType] = useState<"mcq" | "descriptive">("mcq");
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [marksPerQuestion, setMarksPerQuestion] = useState<number>(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!file) {
      alert("Please upload a material first.");
      return;
    }
    if (questionCount <= 0) {
      alert("Please specify a valid number of questions.");
      return;
    }
    if (testType === 'descriptive' && marksPerQuestion <= 0) {
      alert("Please specify valid marks per question.");
      return;
    }

    setIsGenerating(true);
    try {
      let message = "";
      let directTask = "";

      if (testType === "mcq") {
        message = `Generate an MCQ mock test with ${questionCount} questions based on the uploaded material: ${file.name}.`;
        directTask = "mcq_mock_test";
      } else {
        message = `Generate a descriptive mock test with ${questionCount} questions, each worth ${marksPerQuestion} marks, based on the uploaded material: ${file.name}.`;
        directTask = "mock_test";
      }

      await ChatService.sendMessageStream(
        {
          message: message,
          direct_task: directTask,
          create_session: true,
          files: [file],
        },
        (token) => {},
        (structuredData) => {},
        (sessionId) => {}
      );
      
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      onClose();
    } catch (e: any) {
      alert(e.message || "Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <LuFlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Generate Mock Test</h2>
              <p className="text-xs text-gray-500 dark:text-slate-400">Create a new test instantly</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
            <LuX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Upload Material</label>
            <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:border-indigo-400 transition-all cursor-pointer">
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept=".pdf,.docx,.pptx,.txt"
              />
              <LuUpload className="w-8 h-8 text-indigo-500 mb-2" />
              {file ? (
                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate w-full text-center">{file.name}</span>
              ) : (
                <span className="text-sm text-gray-500 dark:text-slate-400">Click to upload material</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Test Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTestType("mcq")}
                className={`py-2 px-4 rounded-xl text-sm font-medium border transition-all ${
                  testType === "mcq" 
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300" 
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                MCQ Test
              </button>
              <button
                onClick={() => setTestType("descriptive")}
                className={`py-2 px-4 rounded-xl text-sm font-medium border transition-all ${
                  testType === "descriptive" 
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300" 
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                Descriptive Test
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Questions</label>
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
                className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-gray-900 dark:text-white"
              />
            </div>
            {testType === "descriptive" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Marks / Q</label>
                <input 
                  type="number" 
                  min={1} 
                  max={20} 
                  value={marksPerQuestion === 0 ? "" : marksPerQuestion} 
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setMarksPerQuestion(0);
                    } else {
                      let num = parseInt(val);
                      if (num > 20) num = 20;
                      setMarksPerQuestion(num);
                    }
                  }}
                  className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-gray-900 dark:text-white"
                />
              </div>
            )}
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3 bg-gray-50 dark:bg-slate-800/30">
          <button 
            onClick={onClose} 
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleGenerate} 
            disabled={isGenerating || !file || questionCount <= 0 || (testType === 'descriptive' && marksPerQuestion <= 0)}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {isGenerating ? (
              <><LuLoader className="w-4 h-4 animate-spin" /> Generating...</>
            ) : (
              "Generate"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateMockTestModal;
