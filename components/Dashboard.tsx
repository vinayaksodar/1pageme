"use client";

import React from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { Plus, FileText, Trash2, Clock } from 'lucide-react';

const Dashboard = () => {
  const { resumes, createNewResume, setActiveResume, deleteResume } = useResumeStore();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Resumes</h1>
            <p className="text-gray-500 mt-1">Select a document to edit or create a new one.</p>
          </div>
          <button
            onClick={createNewResume}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md active:scale-95"
          >
            <Plus size={20} /> Create New
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
            >
              <div 
                onClick={() => setActiveResume(resume.id)}
                className="flex-1 p-6 cursor-pointer"
              >
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FileText size={24} />
                </div>
                <h3 className="font-bold text-lg text-gray-900 truncate">{resume.title || 'Untitled Resume'}</h3>
                <div className="flex items-center gap-2 text-gray-400 text-xs mt-2">
                  <Clock size={12} />
                  <span>Last edited recently</span>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {resume?.activeTemplateId || 'standard'} Layout
                 </span>
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     if (confirm('Are you sure you want to delete this resume?')) {
                        deleteResume(resume.id);
                     }
                   }}
                   className="text-gray-400 hover:text-red-500 transition-colors p-1"
                 >
                    <Trash2 size={16} />
                 </button>
              </div>
            </div>
          ))}

          {resumes.length === 0 && (
            <div 
              onClick={createNewResume}
              className="col-span-full border-2 border-dashed border-gray-300 rounded-2xl p-20 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 cursor-pointer transition-all"
            >
              <Plus size={48} className="mb-4" />
              <p className="font-medium text-lg">No resumes found. Click to create your first one!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
