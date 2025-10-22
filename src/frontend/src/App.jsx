import { useState, useEffect } from 'react'
import './App.css'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'


function App() {
  const [markdownContent, setMarkdownContent] = useState('');

  useEffect(() => {
    fetch('/example.md')
      .then((res) => res.text())
      .then((text) => setMarkdownContent(text))
  }, [])

  return (
    <>
      <Markdown remarkPlugins={[remarkGfm]}>{markdownContent}</Markdown>
    </>
  )
}

export default App
