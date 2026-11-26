import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateTicket from './pages/CreateTicket';
import TicketDetail from './pages/TicketDetail';
import AdminDashboard from './pages/AdminDashboard';
import AdminTickets from './pages/AdminTickets';
import './index.css';

function App() {
  return <AuthProvider><BrowserRouter><Routes>
    <Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} />
    <Route element={<ProtectedRoute />}><Route element={<Layout />}><Route index element={<Dashboard />} /><Route path="tickets/new" element={<CreateTicket />} /><Route path="tickets/:id" element={<TicketDetail />} /></Route></Route>
    <Route element={<ProtectedRoute adminOnly />}><Route element={<Layout />}><Route path="admin" element={<AdminDashboard />} /><Route path="admin/tickets" element={<AdminTickets />} /></Route></Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></BrowserRouter></AuthProvider>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
