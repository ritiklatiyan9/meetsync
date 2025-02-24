import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './Pages/Header';
import Home from './Pages/Home';
import MeetingInitial from './Pages/MeetingInitial';
import Contact from './Pages/Contact';

function App() {
  useEffect(() => {
    // Block right click
    const blockContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // Block keyboard shortcuts
    const blockKeyCombinations = (e) => {
      const forbiddenKeys = {
        'F12': true,
        'F8': true,
        'I': e.ctrlKey || e.metaKey,
        'J': e.ctrlKey || e.metaKey,
        'C': e.ctrlKey && e.shiftKey,
        'U': e.ctrlKey
      };

      if (forbiddenKeys[e.key] || (e.ctrlKey && e.shiftKey && e.key === 'C')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', blockContextMenu);
    document.addEventListener('keydown', blockKeyCombinations);

    // Disable text selection
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    
    // Disable image dragging
    document.querySelectorAll('img').forEach(img => {
      img.addEventListener('dragstart', (e) => e.preventDefault());
    });

    return () => {
      document.removeEventListener('contextmenu', blockContextMenu);
      document.removeEventListener('keydown', blockKeyCombinations);
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
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