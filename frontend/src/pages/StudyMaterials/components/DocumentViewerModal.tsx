import React, { useState } from "react";
import { FiX, FiSearch, FiMessageSquare, FiDownload } from "react-icons/fi";
import { useMaterialDetail } from "../../../hooks/useCore";
import { useNavigate } from "react-router-dom";

interface DocumentViewerModalProps {
  materialId: string;
  onClose: () => void;
}

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  materialId,
  onClose,
}) => {
  const { data: material, isLoading, isError } = useMaterialDetail(materialId);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return text;
    const regex = new RegExp(`(${search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, "gi");
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <mark key={index} className="bg-yellow-200 dark:bg-yellow-500/40 text-gray-900 dark:text-white rounded px-0.5 font-semibold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
          <div className="flex-1 min-w-0 pr-4">
            {isLoading ? (
              <div className="h-6 w-48 bg-gray-200 dark:bg-slate-800 rounded animate-pulse" />
            ) : (
              <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                {material?.title}
              </h3>
            )}
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 uppercase tracking-wider">
              {isLoading ? "Loading details..." : `${material?.file_type} Document`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl text-gray-500 hover:text-gray-700 dark:hover:text-slate-300 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar / Controls */}
        {!isLoading && !isError && material && (
          <div className="px-6 py-3 border-b border-gray-150 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <FiSearch className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search words inside document..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
              />
            </div>

            {/* Origin Chat Session Link */}
            {material.origin_session_id && (
              <button
                onClick={() => {
                  onClose();
                  navigate('/chat', { state: { sessionId: material.origin_session_id } });
                }}
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-xl transition-all self-start sm:self-center"
              >
                <FiMessageSquare className="w-3.5 h-3.5" />
                <span>Uploaded in: <span className="underline">{material.origin_session_title || "Chat Session"}</span></span>
              </button>
            )}
          </div>
        )}

        {/* Document Body Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50 dark:bg-slate-950/50">
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded animate-pulse w-full" />
              <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded animate-pulse w-5/6" />
              <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded animate-pulse w-full" />
              <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded animate-pulse w-4/5" />
              <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded animate-pulse w-2/3" />
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <p className="text-red-500 font-semibold mb-2">Failed to load document content</p>
              <p className="text-xs text-gray-400">Please try again later or verify if the file was deleted.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm max-w-3xl mx-auto font-serif leading-relaxed text-gray-800 dark:text-slate-200 text-base md:text-lg whitespace-pre-wrap select-text selection:bg-indigo-500/20">
              {material?.content ? highlightText(material.content, searchTerm) : (
                <div className="text-center py-12 text-gray-400 italic">
                  No text content extracted from this document.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <p className="text-xs text-gray-400 dark:text-slate-500">
            {material?.created_at && `Uploaded on: ${new Date(material.created_at).toLocaleDateString()}`}
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            Close Reader
          </button>
        </div>

      </div>
    </div>
  );
};

export default DocumentViewerModal;
