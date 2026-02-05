import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './pages/Navigation/Navigation';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/navigation" element={<Navigation />} />
                <Route path="*" element={<Navigate to="/navigation" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
