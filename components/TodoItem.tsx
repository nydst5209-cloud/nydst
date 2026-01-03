
import React from 'react';
import { Todo } from '../types';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete }) => {
  return (
    <div className={`flex items-center justify-between p-3 mb-2 rounded-lg border border-slate-200 bg-white shadow-sm transition-all ${todo.completed ? 'opacity-60 bg-slate-50' : ''}`}>
      <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => onToggle(todo.id)}>
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
        />
        <span className={`${todo.completed ? 'line-through text-slate-400' : 'text-slate-700'} font-medium`}>
          {todo.text}
          {todo.isAiGenerated && <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-bold uppercase">Plan</span>}
        </span>
      </div>
      {!todo.isAiGenerated && (
        <button
          onClick={() => onDelete(todo.id)}
          className="text-slate-400 hover:text-red-500 transition-colors p-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default TodoItem;
