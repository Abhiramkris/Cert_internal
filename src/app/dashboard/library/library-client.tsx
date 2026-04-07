'use client'

import React, { useState } from 'react';
import { Play, ExternalLink, Search, Info, X, Hash } from 'lucide-react';
import { toast } from 'sonner';
import { COMPONENT_TEMPLATES } from '@/utils/builder/templates';

interface LibraryClientProps {
  components: any[];
}

export function LibraryClient({ components }: LibraryClientProps) {
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = components.filter(c => 
    c.id.toLowerCase().includes(search.toLowerCase()) || 
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handlePreview = (id: string) => {
    setPreviewId(id);
  };

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input 
          type="text"
          placeholder="Filter components..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-zinc-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((component) => (
          <div 
            key={component.id}
            className="group bg-white border border-zinc-200 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-zinc-200/50 transition-all duration-500 flex flex-col"
          >
            {/* Visual Header */}
            <div className="aspect-[16/10] bg-zinc-950 relative overflow-hidden flex items-center justify-center p-8">
               <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
               <div className="relative z-10 text-center space-y-3 scale-95 group-hover:scale-100 transition-transform duration-700">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-xl border border-white/10">
                     <Play className="w-5 h-5 text-white fill-current" />
                  </div>
                  <div className="text-[10px] font-black text-white/40 uppercase tracking-[.3em]">
                     Unit Identifier: {component.id}
                  </div>
               </div>
            </div>

            {/* Info Section */}
            <div className="p-6 flex-1 flex flex-col gap-4">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-zinc-950 tracking-tight italic uppercase leading-none">
                  {component.name || component.id.replace(/_/g, ' ')}
                </h3>
                <p className="text-zinc-500 text-xs font-medium line-clamp-2">
                  {component.description || "High-fidelity production component ready for AI deployment."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {(component.industry_relevance || ['general']).map((tag: string) => (
                  <span key={tag} className="text-[9px] font-bold px-2 py-0.5 bg-zinc-100 text-zinc-500 rounded-full uppercase tracking-widest">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-auto pt-4 border-t border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  <Info className="w-3.5 h-3.5" />
                  {Object.keys(component.content_schema || {}).length || component.content_fields?.length || 0} Fields
                </div>

                <button 
                  onClick={() => handlePreview(component.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-950 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Local Preview
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Local Preview Modal */}
      {previewId && (
        <div className="fixed inset-0 z-[200] bg-zinc-950/40 backdrop-blur-md flex items-center justify-center p-6 sm:p-12">
           <div className="bg-[#fafafa] w-full h-full max-w-[1600px] border border-zinc-200/50 rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col relative origin-center">
              
              <div className="h-16 border-b border-zinc-200 bg-white flex items-center justify-between px-6 shrink-0 relative z-10 shadow-sm">
                 <div className="flex items-center gap-4">
                    <div className="bg-zinc-950 text-white px-3 py-1.5 rounded-full flex items-center gap-2">
                       <Hash className="w-3 h-3 text-zinc-500" />
                       <span className="text-[10px] font-black uppercase tracking-widest">{previewId.split('_')[0]}</span>
                    </div>
                    <div className="h-4 w-[1px] bg-zinc-200" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                       Local Module Render
                    </span>
                 </div>
                 <button 
                   onClick={() => setPreviewId(null)}
                   className="w-10 h-10 flex items-center justify-center bg-zinc-100 hover:bg-red-50 hover:text-red-500 rounded-full text-zinc-500 transition-all cursor-pointer"
                 >
                    <X className="w-4 h-4" />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto relative no-scrollbar bg-zinc-50/50">
                 <div className="min-h-full w-full bg-white relative pb-32 pt-[100px]">
                    {(() => {
                       const template = (COMPONENT_TEMPLATES as any)[previewId];
                       if (!template || !template.preview) return (
                          <div className="h-full min-h-[400px] flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-zinc-400">
                             Preview Block Not Yielded
                          </div>
                       );
                       
                       const mockConfig = {
                         primary_color: '#000000',
                         font_family_heading: 'Inter',
                         font_family_body: 'Inter',
                       };
                       const mockContent = {
                         brand_name: 'Library Audit'
                       };
                       
                       return template.preview(mockConfig, mockContent, {}, ['Home', 'Audit', 'Live Session']);
                    })()}
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
