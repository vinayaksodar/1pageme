import React from 'react'
import { useResumeStore } from '@/store/useResumeStore'
import { Plus, FileText, Trash2, Clock } from 'lucide-react'

const Dashboard = () => {
  const { resumes, createNewResume, setActiveResume, deleteResume } =
    useResumeStore()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              My Resumes
            </h1>
            <p className="mt-1 text-gray-500">
              Select a document to edit or create a new one.
            </p>
          </div>
          <button
            onClick={createNewResume}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95"
          >
            <Plus size={20} /> Create New
          </button>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
            >
              <div
                onClick={() => setActiveResume(resume.id)}
                className="flex-1 cursor-pointer p-6"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                  <FileText size={24} />
                </div>
                <h3 className="truncate text-lg font-bold text-gray-900">
                  {resume.title || 'Untitled Resume'}
                </h3>
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                  <Clock size={12} />
                  <span>Last edited recently</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-4">
                <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                  {resume?.activeTemplateId || 'standard'} Layout
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (
                      confirm('Are you sure you want to delete this resume?')
                    ) {
                      deleteResume(resume.id)
                    }
                  }}
                  className="p-1 text-gray-400 transition-colors hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {resumes.length === 0 && (
            <div
              onClick={createNewResume}
              className="col-span-full flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 p-20 text-gray-400 transition-all hover:border-blue-400 hover:text-blue-500"
            >
              <Plus size={48} className="mb-4" />
              <p className="text-lg font-medium">
                No resumes found. Click to create your first one!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
