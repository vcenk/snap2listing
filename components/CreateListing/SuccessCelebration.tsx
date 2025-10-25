'use client';

import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';

interface SuccessCelebrationProps {
  show: boolean;
  message?: string;
  type?: 'step' | 'final';
  onComplete?: () => void;
}

export default function SuccessCelebration({
  show,
  message = 'Great job!',
  type = 'step',
  onComplete,
}: SuccessCelebrationProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; y: number; rotation: number; color: string }>>([]);

  useEffect(() => {
    if (show) {
      // Generate confetti particles
      const particles = Array.from({ length: type === 'final' ? 50 : 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -20 + Math.random() * 10,
        rotation: Math.random() * 360,
        color: ['#4CAF50', '#2196F3', '#FFC107', '#E91E63', '#9C27B0'][Math.floor(Math.random() * 5)],
      }));
      setConfetti(particles);

      // Clear confetti and call onComplete after animation
      const timeout = setTimeout(() => {
        setConfetti([]);
        onComplete?.();
      }, type === 'final' ? 3000 : 1500);

      return () => clearTimeout(timeout);
    }
  }, [show, type, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Confetti particles */}
          {confetti.map((particle) => (
            <Box
              key={particle.id}
              component={motion.div}
              initial={{
                x: `${particle.x}vw`,
                y: `${particle.y}vh`,
                opacity: 1,
                scale: 0,
                rotate: 0,
              }}
              animate={{
                y: '120vh',
                opacity: [1, 1, 0],
                scale: [0, 1, 1],
                rotate: particle.rotation + 720,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: type === 'final' ? 2.5 : 1.5,
                ease: 'easeOut',
                delay: Math.random() * 0.3,
              }}
              sx={{
                position: 'fixed',
                pointerEvents: 'none',
                zIndex: 9999,
              }}
            >
              {type === 'final' ? (
                <StarIcon sx={{ fontSize: 24, color: particle.color }} />
              ) : (
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    backgroundColor: particle.color,
                    borderRadius: type === 'final' ? '50%' : '2px',
                  }}
                />
              )}
            </Box>
          ))}

          {/* Success message (only for final celebration) */}
          {type === 'final' && (
            <Box
              component={motion.div}
              initial={{ scale: 0, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
                delay: 0.2,
              }}
              sx={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 9999,
                textAlign: 'center',
                pointerEvents: 'none',
              }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 0.6,
                  repeat: 2,
                }}
              >
                <CheckCircleIcon
                  sx={{
                    fontSize: 120,
                    color: '#4CAF50',
                    filter: 'drop-shadow(0 4px 20px rgba(76, 175, 80, 0.5))',
                  }}
                />
              </motion.div>
              <Typography
                variant="h3"
                sx={{
                  mt: 2,
                  fontWeight: 700,
                  color: '#4CAF50',
                  textShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                }}
              >
                {message}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mt: 1,
                  color: 'text.secondary',
                }}
              >
                You've completed your listing! 🎉
              </Typography>
            </Box>
          )}

          {/* Step completion badge (subtle) */}
          {type === 'step' && (
            <Box
              component={motion.div}
              initial={{ scale: 0, opacity: 0, x: 20 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              exit={{ scale: 0, opacity: 0, x: 20 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
              }}
              sx={{
                position: 'fixed',
                top: 100,
                right: 40,
                zIndex: 9999,
                backgroundColor: '#4CAF50',
                color: 'white',
                px: 3,
                py: 1.5,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(76, 175, 80, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 24 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {message}
              </Typography>
            </Box>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
