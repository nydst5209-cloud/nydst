
import React from 'react';
import { ZhugeLiangAdvice } from '../types';

interface AdvicePanelProps {
  advice: ZhugeLiangAdvice | null;
  isLoading: boolean;
}

const AdvicePanel: React.FC<AdvicePanelProps> = ({ advice, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-indigo-100 animate-pulse min-h-[180px] flex items-center justify-center">
        <div className="text-indigo-400 font-serif-kr text-xl">제갈량의 책략을 불러오는 중...</div>
      </div>
    );
  }

  if (!advice) return null;

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-indigo-100 flex flex-col md:flex-row gap-6 items-center">
      <div className="flex-shrink-0 flex flex-col items-center">
        <div className="w-20 h-20 bg-indigo-900 rounded-full flex items-center justify-center overflow-hidden border-4 border-indigo-200 mb-2">
          <img 
            src="https://picsum.photos/seed/zhugeliang/200/200" 
            alt="Zhuge Liang" 
            className="w-full h-full object-cover opacity-80"
          />
        </div>
        <span className="text-indigo-900 font-serif-kr font-bold">제갈공명</span>
      </div>
      
      <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
          <h4 className="text-xs font-bold text-indigo-800 mb-1 uppercase tracking-wider flex items-center gap-1">
             <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> 오늘의 행보
          </h4>
          <p className="text-slate-700 text-sm leading-relaxed">{advice.todo}</p>
        </div>
        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
          <h4 className="text-xs font-bold text-amber-800 mb-1 uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 bg-amber-500 rounded-full"></span> 주의할 기운
          </h4>
          <p className="text-slate-700 text-sm leading-relaxed">{advice.caution}</p>
        </div>
        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
          <h4 className="text-xs font-bold text-emerald-800 mb-1 uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> 동기부여의 서
          </h4>
          <p className="text-slate-700 text-sm italic font-serif-kr leading-relaxed">"{advice.motivation}"</p>
        </div>
      </div>
    </div>
  );
};

export default AdvicePanel;
