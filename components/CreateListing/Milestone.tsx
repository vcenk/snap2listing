'use client';

import { Box, Typography, alpha } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

export type MilestoneStatus = 'locked' | 'active' | 'complete';

interface MilestoneProps {
  id: number;
  label: string;
  icon: string;
  status: MilestoneStatus;
  position: { x: number; y: number };
  description?: string;
  onClick?: () => void;
}

const statusColors = {
  locked: {
    bg: '#E0E0E0',
    border: '#BDBDBD',
    text: '#9E9E9E',
  },
  active: {
    bg: 'linear-gradient(135deg, #2196F3 0%, #00BCD4 100%)',
    border: '#2196F3',
    text: '#FFFFFF',
    glow: '0 0 20px rgba(33, 150, 243, 0.6)',
  },
  complete: {
    bg: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
    border: '#4CAF50',
    text: '#FFFFFF',
  },
};

export default function Milestone({
  id,
  label,
  icon,
  status,
  position,
  description,
  onClick,
}: MilestoneProps) {
  const colors = statusColors[status];
  const isInteractive = status !== 'locked';

  return (
    <Box
      component={motion.div}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: id * 0.1,
      }}
      sx={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
        cursor: isInteractive ? 'pointer' : 'default',
        zIndex: 10,
      }}
      onClick={isInteractive ? onClick : undefined}
    >
      {/* Milestone Circle */}
      <Box
        component={motion.div}
        whileHover={isInteractive ? { scale: 1.1 } : {}}
        whileTap={isInteractive ? { scale: 0.95 } : {}}
        animate={
          status === 'complete'
            ? {
                scale: [1, 1.15, 1],
                transition: { duration: 0.5 },
              }
            : status === 'active'
            ? {
                boxShadow: [
                  '0 0 0 0 rgba(33, 150, 243, 0.7)',
                  '0 0 0 15px rgba(33, 150, 243, 0)',
                ],
                transition: {
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: 'loop',
                },
              }
            : {}
        }
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: colors.bg,
          border: `4px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: status === 'active' ? colors.glow : '0 4px 12px rgba(0,0,0,0.15)',
          position: 'relative',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Icon or Status Indicator */}
        <AnimatePresence mode="wait">
          {status === 'complete' ? (
            <motion.div
              key="complete"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <CheckCircleIcon sx={{ fontSize: 40, color: colors.text }} />
            </motion.div>
          ) : status === 'locked' ? (
            <motion.div
              key="locked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LockIcon sx={{ fontSize: 32, color: colors.text }} />
            </motion.div>
          ) : (
            <motion.div
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Typography sx={{ fontSize: 36, filter: 'grayscale(0)' }}>
                {icon}
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse ring for active state */}
        {status === 'active' && (
          <Box
            component={motion.div}
            animate={{
              scale: [1, 1.3],
              opacity: [0.5, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: 'loop',
            }}
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '3px solid #2196F3',
              pointerEvents: 'none',
            }}
          />
        )}
      </Box>

      {/* Label */}
      <Box
        sx={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          mt: 1.5,
          textAlign: 'center',
          width: 120,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: status === 'active' ? 700 : 600,
            color: status === 'locked' ? '#9E9E9E' : '#212121',
            fontSize: '0.875rem',
          }}
        >
          {label}
        </Typography>
        {description && status !== 'locked' && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              display: 'block',
              mt: 0.5,
              fontSize: '0.75rem',
            }}
          >
            {description}
          </Typography>
        )}
      </Box>

      {/* Success burst animation */}
      <AnimatePresence>
        {status === 'complete' && (
          <Box
            component={motion.div}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(76, 175, 80, 0.6) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>
    </Box>
  );
}
