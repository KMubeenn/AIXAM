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

const AssignmentGenerator: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <LuWand className="w-5 h-5 text-indigo-600" />
            Assignment Generator
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Create new assignments from your course materials automatically.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Step 1 of 3
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Upload Area */}
        <div className="w-full lg:w-1/3 p-6 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-4">
            1. Upload Source Material
          </h3>

          <div className="border-2 border-dashed border-indigo-200 bg-white rounded-xl p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer group">
            <div className="bg-indigo-50 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <LuCloudUpload className="w-6 h-6 text-indigo-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PDF, DOCX, or TXT (max 10MB)
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Recent Uploads
            </h4>
            <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
              <div className="p-2 bg-red-50 text-red-600 rounded">
                <LuFileText className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Chapter_4_History.pdf
                </p>
                <p className="text-xs text-gray-500">2.4 MB • Just now</p>
              </div>
              <button className="text-gray-400 hover:text-red-500">
                <LuTrash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignment Type
            </label>
            <select className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-2.5 border bg-white">
              <option>Multiple Choice Quiz</option>
              <option>Essay Prompt</option>
              <option>Short Answer Questions</option>
              <option>Discussion Topics</option>
            </select>
          </div>

          <button className="w-full mt-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2">
            <LuSparkles className="w-4 h-4" />
            Generate Draft
          </button>
        </div>

        {/* Preview Area */}
        <div className="w-full lg:w-2/3 p-6 bg-white">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">2. Preview & Edit</h3>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
                <LuPencil className="w-4 h-4 inline mr-1" /> Edit
              </button>
              <button className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm flex items-center">
                <LuSend className="w-4 h-4 inline mr-1" /> Publish
              </button>
            </div>
          </div>

          {/* Document Preview */}
          <div className="border border-gray-200 rounded-xl shadow-sm p-8 min-h-[500px] bg-white relative">
            <div className="max-w-2xl mx-auto">
              <div className="border-b border-gray-100 pb-6 mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Quiz: The Industrial Revolution
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <LuClock className="w-4 h-4 inline mr-1" /> 30 Minutes
                  </span>
                  <span className="flex items-center">
                    <LuFileQuestion className="w-4 h-4 inline mr-1" /> 10
                    Questions
                  </span>
                  <span className="flex items-center">
                    <LuAward className="w-4 h-4 inline mr-1" /> 20 Points
                  </span>
                </div>
              </div>

              <div className="space-y-8">
                {/* Question 1 */}
                <div className="group relative pl-4 border-l-2 border-transparent hover:border-indigo-500 transition-colors">
                  <div className="absolute -left-[29px] top-0 hidden group-hover:flex flex-col gap-1">
                    <button className="p-1 bg-gray-100 rounded hover:bg-indigo-100 text-gray-500 hover:text-indigo-600">
                      <LuGripVertical className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="font-medium text-gray-900 mb-3">
                    1. Which invention is widely considered to have started the
                    Industrial Revolution?
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200">
                      <div className="w-4 h-4 rounded-full border border-gray-300"></div>
                      <span className="text-gray-600 text-sm">
                        The Steam Engine
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-green-50 border border-green-200 cursor-pointer">
                      <div className="w-4 h-4 rounded-full border-4 border-green-500"></div>
                      <span className="text-gray-800 text-sm font-medium">
                        The Spinning Jenny
                      </span>
                      <LuCheck className="w-4 h-4 text-green-600 ml-auto" />
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200">
                      <div className="w-4 h-4 rounded-full border border-gray-300"></div>
                      <span className="text-gray-600 text-sm">
                        The Cotton Gin
                      </span>
                    </div>
                  </div>
                </div>

                {/* Question 2 */}
                <div className="group relative pl-4 border-l-2 border-transparent hover:border-indigo-500 transition-colors">
                  <p className="font-medium text-gray-900 mb-3">
                    2. Explain the impact of urbanization during the 19th
                    century.
                  </p>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-400 italic">
                    Student answer will appear here...
                  </div>
                </div>

                {/* Question 3 */}
                <div className="group relative pl-4 border-l-2 border-transparent hover:border-indigo-500 transition-colors">
                  <p className="font-medium text-gray-900 mb-3">
                    3. True or False: Child labor laws were immediately enacted
                    at the start of the revolution.
                  </p>
                  <div className="flex gap-4">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                      True
                    </button>
                    <button className="px-4 py-2 border-2 border-green-500 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                      False
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
                <button className="text-indigo-600 text-sm font-medium hover:text-indigo-700 flex items-center gap-1">
                  <LuCirclePlus className="w-4 h-4" />
                  Add another question
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentGenerator;
