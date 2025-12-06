
// import { useState, useEffect } from 'react'
import './App.css'
// import Markdown from 'react-markdown'
// import remarkGfm from 'remark-gfm'

import { Routes, Route, BrowserRouter, useLocation, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Bookmark from './pages/workspace/Bookmark';
import Tagslist from './pages/workspace/Tagslist';
import Myworkspace from './pages/workspace/Myworkspace';
import { DocumentProvider } from './context/DocumentContext';
import Mytrash from './pages/workspace/Mytrash';
import SettingsPage from './pages/Setting';
import EditorPage from './pages/EditorPage';
import Community from './pages/workspace/Community'
import ViewDocument from './pages/workspace/ViewDocument';
import Chatbot from './components/Chatbot/Chatbot';



import { UIProvider } from './context/UIProvider';
import { ToastProvider } from './context/ToastContext';
import { AxiosInterceptor } from './hooks/useApi';

function AppRoutes() {
  const location = useLocation();
  return (
    <Routes location={location} key={location.pathname}>
      <Route path='/' element={<Navigate to='/login' replace />} />
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/home' element={<Home />} />
      <Route path='/home/bookmark' element={<Bookmark />} />
      <Route path='/home/tagslist' element={<Tagslist />} />
      <Route path='/home/community' element={<Community />} />
      <Route path='/home/community/doc/:id' element={<ViewDocument />} />
      <Route path='/home/myworkspace' element={<Myworkspace />} />

      <Route path='/home/mytrash' element={<Mytrash />} />
      <Route path='/home/setting' element={<SettingsPage />} />
      <Route path='/home/editor' element={<EditorPage />} />

    </Routes >
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <UIProvider>
        <ToastProvider>
          <DocumentProvider>
            <AxiosInterceptor>

              <AppRoutes />

              {/* <Chatbot /> */}
            </AxiosInterceptor>
          </DocumentProvider>
        </ToastProvider>
      </UIProvider>
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
