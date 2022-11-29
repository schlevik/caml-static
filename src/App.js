import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import { Navigate } from "react-router-dom";

function App() {
  return (
      <Router>
          <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="*" element={<Navigate to="/" replace={true} />} />

          </Routes>
      </Router>
  );
}
// REACT_APP_ENV=dev npm start

export default App;
