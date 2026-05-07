import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: '', inputText: '', operation: 'uppercase' });

  const fetchTasks = async () => {
    const { data } = await api.get('/tasks');
    setTasks(data);
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/tasks', form);
    setForm({ title: '', inputText: '', operation: 'uppercase' });
    fetchTasks();
  };

  const statusColor = {
    pending: 'orange', running: 'blue', success: 'green', failed: 'red'
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <h1>AI Task Platform</h1>
      <button onClick={() => { localStorage.removeItem('token'); window.location.href='/login'; }}>
        Logout
      </button>

      <form onSubmit={handleSubmit} style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input placeholder="Task title" value={form.title}
          onChange={e => setForm({...form, title: e.target.value})} required />
        <textarea placeholder="Input text" value={form.inputText}
          onChange={e => setForm({...form, inputText: e.target.value})} required />
        <select value={form.operation} onChange={e => setForm({...form, operation: e.target.value})}>
          <option value="uppercase">Uppercase</option>
          <option value="lowercase">Lowercase</option>
          <option value="reverse">Reverse</option>
          <option value="wordcount">Word Count</option>
        </select>
        <button type="submit">Run Task</button>
      </form>

      <div style={{ marginTop: 32 }}>
        {tasks.map(task => (
          <div key={task._id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginBottom: 12 }}>
            <strong>{task.title}</strong>
            <span style={{ marginLeft: 12, color: statusColor[task.status] }}>
              [{task.status}]
            </span>
            {task.result && <p><b>Result:</b> {task.result}</p>}
            <p style={{ fontSize: 12, color: '#888' }}>
              Input: {task.inputText} | Op: {task.operation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}