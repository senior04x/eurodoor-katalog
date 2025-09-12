import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AppLoaderProps {
  isLoading: boolean;
}

export default function AppLoader({ isLoading }: AppLoaderProps) {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (!isLoading) {
      setOpacity(0);
    }
  }, [isLoading]);

  if (!isLoading && opacity === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
        >
          <div className="text-center">
            {/* App Name */}
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-2xl font-bold mb-8 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent"
            >
              Eurodoor
            </motion.h1>
            
            {/* Modern Spinner */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="relative"
            >
              <div className="w-16 h-16 mx-auto border-4 border-white/20 border-t-blue-400 rounded-full animate-spin" />
              <div className="absolute inset-0 w-16 h-16 mx-auto border-4 border-transparent border-r-purple-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </motion.div>
            
            {/* Loading Text */}
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-white/70 mt-4 text-sm"
            >
              Yuklanmoqda...
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}