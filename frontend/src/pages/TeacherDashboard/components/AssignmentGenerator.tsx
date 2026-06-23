import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  LuWand,
  LuCloudUpload,
  LuFileText,
  LuTrash2,
  LuSparkles,
  LuPencil,
  LuSend,
  LuClock,
  LuFileQuestion,
  LuAward,
  LuGripVertical,
  LuCheck,
  LuCirclePlus,
} from "react-icons/lu";
import { ChatService } from "../../../services/chat.service";

const AssignmentGenerator: React.FC = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [assignmentType, setAssignmentType] = useState("Multiple Choice Quiz");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<string>("");
  const [structuredData, setStructuredData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const formatStructuredData = (structured: any): string => {
    if (!structured || !structured.data) return "";
    const data = structured.data;
    
    if (structured.type === "teacher_quiz") {
      const questions = Array.isArray(data) ? data : data.questions || [];
      return questions.map((q: any, idx: number) => {
        let text = `Q${idx + 1}. ${q.question || ""}\n`;
        if (q.options) {
          Object.entries(q.options).forEach(([key, val]) => {
            text += `  ${key}) ${val}\n`;
          });
        }
        text += `Correct Answer: ${q.answer || ""}\n`;
        if (q.explanation) {
          text += `Explanation: ${q.explanation}\n`;
        }
        return text;
      }).join("\n");
    }
    
    if (structured.type === "assignment") {
      const title = data.title || "Assignment";
      const totalMarks = data.total_marks || 100;
      const questions = data.questions || [];
      let text = `Title: ${title}\nTotal Marks: ${totalMarks}\n\n`;
      questions.forEach((q: any, idx: number) => {
        text += `Q${idx + 1}. ${q.question || ""} (Marks: ${q.marks || 1})\n`;
        if (q.rubric) {
          text += `Rubric: ${q.rubric}\n`;
        }
        text += "\n";
      });
      return text;
    }
    
    if (structured.type === "slide_outline") {
      const title = data.presentation_title || "Presentation";
      const slides = data.slides || [];
      let text = `Presentation Title: ${title}\n\n`;
      slides.forEach((s: any) => {
        text += `--- Slide ${s.slide_number || 1}: ${s.title || ""} ---\n`;
        if (Array.isArray(s.bullet_points)) {
          s.bullet_points.forEach((bp: string) => {
            text += `* ${bp}\n`;
          });
        }
        if (s.speaker_notes) {
          text += `Speaker Notes: ${s.speaker_notes}\n`;
        }
        text += "\n";
      });
      return text;
    }
    
    return JSON.stringify(data, null, 2);
  };

  const handleGenerate = async () => {
    if (files.length === 0) return;
    setIsGenerating(true);
    setGeneratedDraft("");
    setStructuredData(null);
    setIsPublished(false);
    setIsEditing(false);

    try {
      await ChatService.sendMessageStream(
        {
          message: `Generate a ${assignmentType} from the uploaded files.`,
          files: files,
          create_session: true,
        },
        (token) => {
          setGeneratedDraft((prev) => prev + token);
        },
        (data) => {
          setStructuredData(data);
          const formatted = formatStructuredData(data);
          if (formatted) {
            setGeneratedDraft(formatted);
          }
        },
        () => {}
      );
    } catch (error) {
      console.error("Generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = () => {
    setIsPublished(true);
    setTimeout(() => {
      if (structuredData?.type === "teacher_quiz") {
        navigate("/teacher-quizzes");
      } else {
        navigate("/teacher-assignments");
      }
    }, 1500);
  };

  const getStepText = () => {
    if (isGenerating) return "Generating...";
    if (isPublished) return "Step 3 of 3: Published";
    if (generatedDraft || structuredData) return "Step 2 of 3: Preview & Edit";
    return "Step 1 of 3: Upload Material";
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <LuWand className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Assignment Generator
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Create new assignments from your course materials automatically.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1 rounded-full uppercase tracking-wider">
            {getStepText()}
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Upload Area */}
        <div className="w-full lg:w-1/3 p-6 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            1. Upload Source Material
          </h3>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            multiple 
          />
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-indigo-200 dark:border-indigo-800/50 bg-white dark:bg-slate-800 rounded-xl p-8 text-center hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-colors cursor-pointer group"
          >
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <LuCloudUpload className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {files.length > 0 ? `${files.length} files selected` : "Click to upload or drag and drop"}
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              PDF, DOCX, or TXT (max 10MB)
            </p>
          </div>

          {files.length > 0 && (
            <div className="mt-6 space-y-3">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider">
                Selected Files
              </h4>
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg">
                  <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded">
                    <LuFileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-200 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <button 
                    onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                    className="text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400"
                  >
                    <LuTrash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Assignment Type
            </label>
            <select 
              value={assignmentType}
              onChange={(e) => setAssignmentType(e.target.value)}
              className="w-full border-gray-300 dark:border-slate-700 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-2.5 border bg-white dark:bg-slate-800 dark:text-white"
            >
              <option>Multiple Choice Quiz</option>
              <option>Essay Prompt</option>
              <option>Short Answer Questions</option>
              <option>Discussion Topics</option>
            </select>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={files.length === 0 || isGenerating}
            className="w-full mt-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LuSparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating...' : 'Generate Draft'}
          </button>
        </div>

        {/* Preview Area */}
        <div className="w-full lg:w-2/3 p-6 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              2. Preview & Edit
            </h3>
            {(generatedDraft || structuredData) && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all flex items-center ${
                    isEditing 
                      ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400" 
                      : "text-gray-600 border-gray-300 dark:text-slate-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <LuPencil className="w-4 h-4 inline mr-1" /> {isEditing ? "View Preview" : "Edit"}
                </button>
                <button 
                  onClick={handlePublish}
                  disabled={isPublished}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-800 rounded-lg shadow-sm flex items-center transition-colors"
                >
                  {isPublished ? (
                    <>
                      <LuCheck className="w-4 h-4 inline mr-1" /> Published
                    </>
                  ) : (
                    <>
                      <LuSend className="w-4 h-4 inline mr-1" /> Publish
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Document Preview */}
          <div className="border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm p-8 min-h-[500px] bg-white dark:bg-slate-900 relative">
            {isPublished && (
              <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-fade-in">
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-full mb-3 text-green-600 dark:text-green-400 animate-bounce">
                  <LuCheck className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">Published Successfully!</h4>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Redirecting to management page...</p>
              </div>
            )}

            <div className="max-w-2xl mx-auto h-full">
              {generatedDraft || structuredData ? (
                isEditing ? (
                  <textarea
                    value={generatedDraft}
                    onChange={(e) => setGeneratedDraft(e.target.value)}
                    className="w-full min-h-[450px] p-6 font-mono text-sm border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                  />
                ) : (
                  <div className="whitespace-pre-wrap font-inter text-gray-850 dark:text-slate-200 leading-relaxed">
                    {generatedDraft}
                  </div>
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 mt-20">
                   <LuFileText className="w-16 h-16 mb-4" />
                   <p className="text-lg font-medium">Your generated assignment will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentGenerator;
