import './App.css'
import { BrowserRouter } from 'react-router-dom';
import { UIProvider } from '@/context/UIProvider';
import { ToastProvider } from '@/context/ToastContext';
import { DocumentProvider } from '@/context/DocumentContext';
import { AISettingsProvider, useAISettings } from '@/context/AISettingsContext';
import { AxiosInterceptor } from '@/hooks/useApi';
import AppRoutes from '@/routes/AppRoutes';
import Chatbot from '@/components/Chatbot/Chatbot';

// Wrapper component to conditionally render Chatbot
function ChatbotWrapper() {
  const { chatbotEnabled } = useAISettings();
  return chatbotEnabled ? <Chatbot /> : null;
}

export default function App() {
  return (
    <BrowserRouter>
      <UIProvider>
        <ToastProvider>
          <DocumentProvider>
            <AISettingsProvider>
              <AxiosInterceptor>
                <AppRoutes />
                <ChatbotWrapper />
              </AxiosInterceptor>
            </AISettingsProvider>
          </DocumentProvider>
        </ToastProvider>
      </UIProvider>
    </BrowserRouter>
  );
}
