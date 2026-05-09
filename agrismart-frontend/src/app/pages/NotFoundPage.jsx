import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
export const NotFoundPage = () => {
    return (<div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-3xl font-bold mb-2">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/">
            <Button className="gap-2">
              <Home className="w-4 h-4"/>
              Go Home
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
            <ArrowLeft className="w-4 h-4"/>
            Go Back
          </Button>
        </div>
      </motion.div>
    </div>);
};
