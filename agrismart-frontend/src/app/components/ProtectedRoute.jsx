import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';
export const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, user, isLoading } = useAuth();
    if (isLoading) {
        return (<div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..."/>
      </div>);
    }
    if (!isAuthenticated) {
        return <Navigate to="/login" replace/>;
    }
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace/>;
    }
    return <>{children}</>;
};
