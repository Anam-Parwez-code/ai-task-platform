import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Abhi ke liye hum sirf Dashboard dikhayenge taaki build pass ho jaye */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<div>Login Page (Coming Soon)</div>} />
        <Route path="/register" element={<div>Register Page (Coming Soon)</div>} />
      </Routes>
    </BrowserRouter>
  );
}