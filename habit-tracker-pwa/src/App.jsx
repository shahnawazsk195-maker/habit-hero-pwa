import React, { useState, useEffect } from 'react';
import { openDB } from 'idb';
import { Flame, CheckCircle, Trash2, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const initDB = async () => {
  return openDB('HabitTrackerDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('habits')) {
        db.createObjectStore('habits', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

function App() {
  const [habits, setHabits] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const loadHabits = async () => {
      const db = await initDB();
      const allHabits = await db.getAll('habits');
      setHabits(allHabits);
    };
    loadHabits();
  }, []);

  const addHabit = async () => {
    if (!input.trim()) return;
    const newHabit = { name: input, streak: 0, completedDates: [], createdAt: new Date().toLocaleDateString() };
    const db = await initDB();
    const id = await db.add('habits', newHabit);
    setHabits([...habits, { ...newHabit, id }]);
    setInput('');
  };

  const toggleComplete = async (habit) => {
    const today = new Date().toLocaleDateString();
    let updatedDates = [...habit.completedDates];
    if (updatedDates.includes(today)) {
      updatedDates = updatedDates.filter(d => d !== today);
    } else {
      updatedDates.push(today);
    }
    const updatedHabit = { ...habit, completedDates: updatedDates, streak: updatedDates.length };
    const db = await initDB();
    await db.put('habits', updatedHabit);
    setHabits(habits.map(h => h.id === habit.id ? updatedHabit : h));
  };

  const deleteHabit = async (id) => {
    const db = await initDB();
    await db.delete('habits', id);
    setHabits(habits.filter(h => h.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans">
      <div className="max-w-2xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-indigo-600 flex items-center justify-center gap-3">
            Habit Hero <Flame className="text-orange-500" />
          </h1>
        </header>

        <div className="flex gap-3 mb-10 shadow-sm p-2 bg-white rounded-2xl border">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="New Habit" 
            className="flex-1 p-4 outline-none text-lg rounded-xl"
          />
          <button onClick={addHabit} className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold">
            Add
          </button>
        </div>

        <div className="grid gap-4">
          {habits.map(habit => (
            <div key={habit.id} className="bg-white p-5 rounded-2xl shadow-sm border flex justify-between items-center group">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{habit.name}</h3>
                <p className="text-orange-600 font-medium flex items-center gap-1">
                  <Flame size={14} /> {habit.streak} day streak
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => toggleComplete(habit)} 
                  className={habit.completedDates.includes(new Date().toLocaleDateString()) ? 'text-green-500' : 'text-slate-200'}
                >
                  <CheckCircle size={40} fill="currentColor" />
                </button>
                <button onClick={() => deleteHabit(habit.id)} className="text-slate-300 hover:text-red-500">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;