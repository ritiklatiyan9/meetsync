import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './Pages/Header';
import Home from './Pages/Home';
import MeetingInitial from './Pages/MeetingInitial';
import Contact from './Pages/Contact';
import { AuthProvider } from "./context/AuthContext";
import Login from './Pages/Login'
import Organisation from './Pages/Organisation';
import Shareable from './Pages/Shareable';

function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
  
      <div className="min-h-screen bg-black"  >
      <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/meeting" element={<MeetingInitial />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/share/:meetingId" element={<Shareable />} />
          <Route path="/org" element={<Organisation/>} />
        </Routes>
      </div>
    </BrowserRouter>
     </AuthProvider>
  );
}

export default App;