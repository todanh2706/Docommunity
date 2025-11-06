// import { useState, useEffect } from 'react'
import './App.css'
// import Markdown from 'react-markdown'
// import remarkGfm from 'remark-gfm'

import { Routes, Route, BrowserRouter, useLocation, Navigate } from 'react-router-dom';
import Login from './pages/Login';

function AppRoutes() {
  const location = useLocation();
  return (
    <Routes location={location} key={location.pathname}>
      <Route path='/' element={<Navigate to='/login' replace />} />
      <Route path='/login' element={<Login />} />
    </Routes >
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
  // Markdown renderer
  // const [markdownContent, setMarkdownContent] = useState('');

  // useEffect(() => {
  //   fetch('/example.md')
  //     .then((res) => res.text())
  //     .then((text) => setMarkdownContent(text))
  // }, [])

  // return (
  //   <>
  //     <Markdown remarkPlugins={[remarkGfm]}>{markdownContent}</Markdown>
  //   </>
  // )
}
