import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './context/AuthContext';
import { router } from './routes';
import { Analytics } from '@vercel/analytics/react';

export default function App() {
    return (<ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <RouterProvider router={router}/>
        <Toaster position="top-right" richColors/>
        <Analytics />
      </AuthProvider>
    </ThemeProvider>);
}
