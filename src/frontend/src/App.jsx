import './App.css'
import { BrowserRouter } from 'react-router-dom';
import { UIProvider } from '@/context/UIProvider';
import { ToastProvider } from '@/context/ToastContext';
import { DocumentProvider } from '@/context/DocumentContext';
import { AxiosInterceptor } from '@/hooks/useApi';
import AppRoutes from '@/routes/AppRoutes';
import Chatbot from '@/components/Chatbot/Chatbot';

export default function App() {
  return (
    <BrowserRouter>
      <UIProvider>
        <ToastProvider>
          <DocumentProvider>
            <AxiosInterceptor>
              <AppRoutes />
              <Chatbot />
            </AxiosInterceptor>
          </DocumentProvider>
        </ToastProvider>
      </UIProvider>
    </BrowserRouter>
  );
}

