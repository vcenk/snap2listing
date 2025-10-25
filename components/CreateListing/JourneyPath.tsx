'use client';

import { Box, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import Milestone, { MilestoneStatus } from './Milestone';

interface MilestoneData {
  id: number;
  label: string;
  icon: string;
  description: string;
}

interface JourneyPathProps {
  milestones: MilestoneData[];
  activeStep: number; // 1-indexed (1 = first step active)
  onStepClick?: (step: number) => void;
}

export default function JourneyPath({
  milestones,
  activeStep,
  onStepClick,
}: JourneyPathProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Calculate milestone positions
  const positions = isMobile
    ? calculateMobilePositions(milestones.length)
    : calculateDesktopPositions(milestones.length);

  // Calculate path between milestones
  const pathD = isMobile
    ? generateMobilePath(positions)
    : generateDesktopPath(positions);

  // Determine status for each milestone
  const getMilestoneStatus = (index: number): MilestoneStatus => {
    if (index < activeStep - 1) return 'complete';
    if (index === activeStep - 1) return 'active';
    return 'locked';
  };

  // Calculate progress percentage for animated path
  const progressPercentage = activeStep === 0 ? 0 : ((activeStep - 1) / (milestones.length - 1)) * 100;

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: isMobile ? 800 : 280,
        mb: 4,
        overflow: 'visible',
      }}
    >
      {/* SVG Path */}
      <svg
        width="100%"
        height="100%"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          overflow: 'visible',
        }}
      >
        <defs>
          {/* Gradient for completed path */}
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#4CAF50', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#66BB6A', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#81C784', stopOpacity: 1 }} />
          </linearGradient>

          {/* Animated gradient for active segment */}
          <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#2196F3', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#00BCD4', stopOpacity: 1 }} />
          </linearGradient>

          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background path (gray, inactive) */}
        <path
          d={pathD}
          fill="none"
          stroke="#E0E0E0"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Completed path (green gradient) */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="url(#pathGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: progressPercentage / 100 }}
          transition={{
            duration: 0.8,
            ease: 'easeInOut',
          }}
          filter="url(#glow)"
        />

        {/* Animated dots along active path */}
        {activeStep > 0 && activeStep <= milestones.length && (
          <motion.circle
            r="4"
            fill="url(#activeGradient)"
            style={{
              offsetPath: `path("${pathD}")`,
              offsetDistance: '0%',
            }}
            animate={{
              offsetDistance: ['0%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )}
      </svg>

      {/* Milestones */}
      {milestones.map((milestone, index) => (
        <Milestone
          key={milestone.id}
          id={milestone.id}
          label={milestone.label}
          icon={milestone.icon}
          description={milestone.description}
          status={getMilestoneStatus(index)}
          position={positions[index]}
          onClick={() => onStepClick?.(index + 1)}
        />
      ))}
    </Box>
  );
}

// Desktop: Curved horizontal path with gentle waves
function calculateDesktopPositions(count: number): Array<{ x: number; y: number }> {
  const positions: Array<{ x: number; y: number }> = [];
  const startX = 100; // px from left
  const endX = 1200; // px from left
  const spacing = (endX - startX) / (count - 1);
  const centerY = 140;
  const amplitude = 40; // Wave height

  for (let i = 0; i < count; i++) {
    const x = startX + i * spacing;
    // Create gentle sine wave
    const y = centerY + amplitude * Math.sin((i / (count - 1)) * Math.PI);
    positions.push({ x, y });
  }

  return positions;
}

// Mobile: Vertical zigzag path
function calculateMobilePositions(count: number): Array<{ x: number; y: number }> {
  const positions: Array<{ x: number; y: number }> = [];
  const centerX = 175; // Center of mobile view
  const spacing = 120;
  const zigzagOffset = 60;

  for (let i = 0; i < count; i++) {
    const y = 80 + i * spacing;
    // Alternate left-right for zigzag
    const x = i % 2 === 0 ? centerX - zigzagOffset : centerX + zigzagOffset;
    positions.push({ x, y });
  }

  return positions;
}

// Generate SVG path string for desktop (curved bezier path)
function generateDesktopPath(positions: Array<{ x: number; y: number }>): string {
  if (positions.length === 0) return '';

  let path = `M ${positions[0].x} ${positions[0].y}`;

  for (let i = 1; i < positions.length; i++) {
    const prev = positions[i - 1];
    const curr = positions[i];

    // Calculate control points for smooth curve
    const midX = (prev.x + curr.x) / 2;
    const cp1x = midX;
    const cp1y = prev.y;
    const cp2x = midX;
    const cp2y = curr.y;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
  }

  return path;
}

// Generate SVG path string for mobile (zigzag with curves)
function generateMobilePath(positions: Array<{ x: number; y: number }>): string {
  if (positions.length === 0) return '';

  let path = `M ${positions[0].x} ${positions[0].y}`;

  for (let i = 1; i < positions.length; i++) {
    const prev = positions[i - 1];
    const curr = positions[i];

    // Smooth curves for zigzag
    const midY = (prev.y + curr.y) / 2;
    path += ` Q ${prev.x} ${midY}, ${curr.x} ${curr.y}`;
  }

  return path;
}
