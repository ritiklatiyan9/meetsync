import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './Pages/Header';
import Home from './Pages/Home';
import MeetingInitial from './Pages/MeetingInitial';
import Contact from './Pages/Contact';

function App() {
  return (
    <BrowserRouter>
  
      <div className="min-h-screen "  >
      <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/meeting" element={<MeetingInitial />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;