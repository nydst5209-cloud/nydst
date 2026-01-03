
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Todo, DayData, ZhugeLiangAdvice, BookPlan } from './types';
import { JANUARY_2026, STORAGE_KEY, PLAN_STORAGE_KEY } from './constants';
import { getDailyAdvice, getBookWritingPlan } from './services/geminiService';
import TodoItem from './components/TodoItem';
import AdvicePanel from './components/AdvicePanel';

const App: React.FC = () => {
  const [calendarData, setCalendarData] = useState<Record<string, Todo[]>>({});
  const [bookPlan, setBookPlan] = useState<BookPlan | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [advice, setAdvice] = useState<ZhugeLiangAdvice | null>(null);
  const [isAdviceLoading, setIsAdviceLoading] = useState(false);
  const [newTodoText, setNewTodoText] = useState('');

  // Initialize data from local storage
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    const savedPlan = localStorage.getItem(PLAN_STORAGE_KEY);
    
    if (savedData) {
      setCalendarData(JSON.parse(savedData));
    }
    
    if (savedPlan) {
      setBookPlan(JSON.parse(savedPlan));
    } else {
      // First time: fetch the initial book plan from Gemini
      initBookPlan();
    }

    // Set today as selected date initially (if within Jan 2026)
    const now = new Date();
    const isJan2026 = now.getFullYear() === 2026 && now.getMonth() === 0;
    const initialDate = isJan2026 
      ? now.toISOString().split('T')[0] 
      : '2026-01-01';
    
    setSelectedDate(initialDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initBookPlan = async () => {
    try {
      const plan = await getBookWritingPlan();
      setBookPlan(plan);
      localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(plan));
      
      // Inject AI plan into calendar data
      setCalendarData(prev => {
        const newData = { ...prev };
        Object.entries(plan).forEach(([date, task]) => {
          if (!newData[date]) newData[date] = [];
          // Avoid duplicate plan items
          if (!newData[date].some(t => t.isAiGenerated)) {
            newData[date].unshift({
              id: `ai-${date}`,
              text: `[집필] ${task}`,
              completed: false,
              isAiGenerated: true
            });
          }
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
        return newData;
      });
    } catch (error) {
      console.error("Failed to fetch book plan", error);
    }
  };

  // Fetch advice when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      const fetchAdvice = async () => {
        setIsAdviceLoading(true);
        try {
          const res = await getDailyAdvice(selectedDate);
          setAdvice(res);
        } catch (error) {
          console.error("Advice error", error);
        } finally {
          setIsAdviceLoading(false);
        }
      };
      fetchAdvice();
    }
  }, [selectedDate]);

  const handleToggleTodo = (date: string, id: string) => {
    const updated = { ...calendarData };
    if (updated[date]) {
      updated[date] = updated[date].map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      );
      setCalendarData(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const handleDeleteTodo = (date: string, id: string) => {
    const updated = { ...calendarData };
    if (updated[date]) {
      updated[date] = updated[date].filter(todo => todo.id !== id);
      setCalendarData(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim() || !selectedDate) return;

    const updated = { ...calendarData };
    const newTodo: Todo = {
      id: Date.now().toString(),
      text: newTodoText,
      completed: false
    };

    if (!updated[selectedDate]) updated[selectedDate] = [];
    updated[selectedDate].push(newTodo);
    
    setCalendarData(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setNewTodoText('');
  };

  const getCompletionStats = (date: string) => {
    const todos = calendarData[date] || [];
    if (todos.length === 0) return null;
    const completedCount = todos.filter(t => t.completed).length;
    const ratio = completedCount / todos.length;
    
    if (ratio >= 0.9) return 'Great';
    if (ratio >= 0.6) return 'Good';
    return null;
  };

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < JANUARY_2026.startDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= JANUARY_2026.daysInMonth; i++) {
      const dateStr = `2026-01-${String(i).padStart(2, '0')}`;
      days.push(dateStr);
    }
    return days;
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-6xl w-full">
        {/* Header section with persona advice */}
        <header className="mb-10 space-y-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-serif-kr font-bold text-indigo-950 mb-2">
              2026년 1월 전략적 집필 달력
            </h1>
            <p className="text-slate-500 font-medium">제갈공명의 지혜와 함께하는 한 달의 기록</p>
          </div>
          
          <AdvicePanel advice={advice} isLoading={isAdviceLoading} />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Calendar Grid */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif-kr font-bold text-slate-800">January 2026</h2>
              <div className="flex gap-4 text-sm font-medium">
                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-400"></span> Great (90%+)</div>
                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-400"></span> Good (60%+)</div>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 md:gap-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-bold text-slate-400 text-xs uppercase py-2">
                  {day}
                </div>
              ))}
              
              {calendarDays.map((date, idx) => {
                if (!date) return <div key={`empty-${idx}`} className="h-24 md:h-32 rounded-2xl bg-slate-50/50"></div>;
                
                const isSelected = selectedDate === date;
                const stamp = getCompletionStats(date);
                const dayNum = date.split('-')[2];
                const todos = calendarData[date] || [];

                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`h-24 md:h-32 rounded-2xl p-2 flex flex-col relative transition-all group border-2 ${
                      isSelected 
                      ? 'border-indigo-500 bg-indigo-50 shadow-inner' 
                      : 'border-transparent bg-white hover:bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <span className={`text-sm md:text-lg font-bold ${isSelected ? 'text-indigo-600' : 'text-slate-700'}`}>
                      {parseInt(dayNum)}
                    </span>
                    
                    {/* Visual indicators for todos */}
                    <div className="mt-auto flex flex-wrap gap-1">
                      {todos.slice(0, 3).map((t, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${t.completed ? 'bg-indigo-300' : 'bg-slate-300'}`}></div>
                      ))}
                      {todos.length > 3 && <span className="text-[8px] text-slate-400">+{todos.length - 3}</span>}
                    </div>

                    {/* Completion Stamps */}
                    {stamp && (
                      <div className={`absolute top-2 right-2 flex items-center justify-center w-6 h-6 md:w-10 md:h-10 rounded-full border-2 border-dashed rotate-12 bg-white/50 backdrop-blur-sm pointer-events-none ${
                        stamp === 'Great' ? 'border-emerald-400 text-emerald-500' : 'border-amber-400 text-amber-500'
                      }`}>
                        <span className="text-[6px] md:text-[10px] font-black uppercase">{stamp}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-4 sticky top-8">
            <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 min-h-[500px] flex flex-col">
              <div className="mb-6">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Detailed Schedule</div>
                <h3 className="text-2xl font-serif-kr font-bold text-slate-800">
                  {selectedDate ? new Date(selectedDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }) : '날짜를 선택하세요'}
                </h3>
              </div>

              {/* Todo List */}
              <div className="flex-grow overflow-y-auto space-y-1 mb-6 max-h-[400px]">
                {selectedDate && (calendarData[selectedDate] || []).length > 0 ? (
                  calendarData[selectedDate].map(todo => (
                    <TodoItem 
                      key={todo.id} 
                      todo={todo} 
                      onToggle={(id) => handleToggleTodo(selectedDate, id)}
                      onDelete={(id) => handleDeleteTodo(selectedDate, id)}
                    />
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 py-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <p className="font-medium">할 일이 없습니다</p>
                  </div>
                )}
              </div>

              {/* Add Todo Form */}
              <form onSubmit={handleAddTodo} className="mt-auto pt-6 border-t border-slate-100">
                <div className="relative">
                  <input
                    type="text"
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    placeholder="새로운 계획을 입력하세요..."
                    className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white px-3 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
            
            <div className="mt-6 bg-indigo-900 rounded-3xl p-6 text-white shadow-xl flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-800 rounded-2xl flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-sm">Zhuge Liang's Wisdom</h4>
                <p className="text-xs text-indigo-200">"가장 원대한 지략은 우직한 실천에서 비롯됩니다."</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="mt-16 mb-8 text-slate-400 text-sm flex flex-col items-center gap-2">
        <p>&copy; 2026 The Strategist's Calendar powered by Gemini</p>
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-400"></span> Book Writing Plan Active</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
