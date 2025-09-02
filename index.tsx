
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QuizApplication } from './App'; // Changed to named import

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <QuizApplication />
  </React.StrictMode>
);