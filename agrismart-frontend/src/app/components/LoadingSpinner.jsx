import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
export const LoadingSpinner = ({ size = 'md', text }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };
    return (<div className="flex flex-col items-center justify-center gap-3">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
        <Loader2 className={`${sizeClasses[size]} text-primary`}/>
      </motion.div>
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>);
};
export const LoadingSkeleton = ({ className }) => (<div className={`animate-pulse bg-muted rounded ${className}`}/>);
