'use client';

import { Box, Typography, keyframes } from '@mui/material';

interface AIGenerationLoaderProps {
  message?: string;
  type?: 'image' | 'video' | 'text' | 'general';
}

const runAnimation = keyframes`
  0%, 100% {
    transform: translateY(0px) rotate(-5deg);
  }
  25% {
    transform: translateY(-10px) rotate(0deg);
  }
  50% {
    transform: translateY(0px) rotate(5deg);
  }
  75% {
    transform: translateY(-10px) rotate(0deg);
  }
`;

const dotsAnimation = keyframes`
  0%, 20% {
    content: '';
  }
  40% {
    content: '.';
  }
  60% {
    content: '..';
  }
  80%, 100% {
    content: '...';
  }
`;

const slideAnimation = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100vw);
  }
`;

const bounceAnimation = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
`;

export default function AIGenerationLoader({
  message = 'AI is working on your listing',
  type = 'general'
}: AIGenerationLoaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 400,
        gap: 3,
      }}
    >
      {/* Running Character Container */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: 80,
          overflow: 'hidden',
          background: 'linear-gradient(90deg, rgba(102,126,234,0.05) 0%, rgba(118,75,162,0.05) 100%)',
          borderRadius: 2,
          mb: 2,
        }}
      >
        {/* Running Character */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            animation: `${slideAnimation} 3s linear infinite`,
            fontSize: 48,
            lineHeight: 1,
          }}
        >
          <Box
            component="span"
            sx={{
              display: 'inline-block',
              animation: `${runAnimation} 0.6s ease-in-out infinite`,
            }}
          >
            🏃
          </Box>
        </Box>

        {/* Trail Effect */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: 0,
            width: '100%',
            height: 2,
            background: 'linear-gradient(90deg, transparent 0%, rgba(102,126,234,0.3) 50%, transparent 100%)',
            transform: 'translateY(-50%)',
          }}
        />
      </Box>

      {/* Message with Animated Dots */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline',
          }}
        >
          {message}
        </Typography>
        <Typography
          component="span"
          variant="h6"
          sx={{
            fontWeight: 600,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            ml: 0.5,
            '&::after': {
              content: '""',
              animation: `${dotsAnimation} 1.5s steps(1, end) infinite`,
            },
          }}
        />
      </Box>

      {/* Magic Sparkles */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        {['✨', '🎨', '🚀'].map((emoji, index) => (
          <Box
            key={index}
            sx={{
              fontSize: 24,
              animation: `${bounceAnimation} 1s ease-in-out infinite`,
              animationDelay: `${index * 0.2}s`,
            }}
          >
            {emoji}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
