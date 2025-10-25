'use client';

import {
  Box,
  Card,
  TextField,
  Typography,
  Button,
  Stack,
  Paper,
  IconButton,
  Collapse,
  CircularProgress,
  Chip,
  Alert,
} from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SmartDescriptionComposerProps {
  imageUrl: string;
  initialDescription?: string;
  onDescriptionChange: (description: string) => void;
  onModeChange?: (mode: 'ai_suggested' | 'user_editing' | 'chat_refining') => void;
}

export default function SmartDescriptionComposer({
  imageUrl,
  initialDescription = '',
  onDescriptionChange,
  onModeChange,
}: SmartDescriptionComposerProps) {
  const [description, setDescription] = useState(initialDescription);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [activeMode, setActiveMode] = useState<'ai_suggested' | 'user_editing' | 'chat_refining'>('user_editing');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [error, setError] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-generate description when image is uploaded
  useEffect(() => {
    if (imageUrl && !aiSuggestion) {
      generateDescription();
    }
  }, [imageUrl]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const generateDescription = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const response = await fetch('/api/generateDescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imageUrl,
          short_description: description || undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAiSuggestion(data.suggestion);
        setDescription(data.suggestion);
        setActiveMode('ai_suggested');
        onDescriptionChange(data.suggestion);
        onModeChange?.('ai_suggested');
      } else {
        setError(data.error || 'Failed to generate description');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate description');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseAI = () => {
    if (aiSuggestion) {
      setDescription(aiSuggestion);
      onDescriptionChange(aiSuggestion);
      setActiveMode('ai_suggested');
      onModeChange?.('ai_suggested');
    }
  };

  const handleWriteOwn = () => {
    setDescription('');
    setAiSuggestion('');
    setActiveMode('user_editing');
    onModeChange?.('user_editing');
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    onDescriptionChange(value);
    if (activeMode !== 'user_editing') {
      setActiveMode('user_editing');
      onModeChange?.('user_editing');
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || !description) return;

    const userMessage: Message = { role: 'user', content: chatInput };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput('');
    setIsRefining(true);
    setActiveMode('chat_refining');
    onModeChange?.('chat_refining');

    try {
      const response = await fetch('/api/refineDescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_description: description,
          instruction: chatInput,
          conversation_history: chatMessages.slice(-4), // Last 2 exchanges
        }),
      });

      const data = await response.json();
      if (data.success) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.refined_text,
        };
        setChatMessages((prev) => [...prev, assistantMessage]);
      } else {
        setError(data.error || 'Failed to refine description');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to refine description');
    } finally {
      setIsRefining(false);
    }
  };

  const handleUseChatVersion = () => {
    const lastAssistantMessage = [...chatMessages]
      .reverse()
      .find((msg) => msg.role === 'assistant');
    
    if (lastAssistantMessage) {
      setDescription(lastAssistantMessage.content);
      onDescriptionChange(lastAssistantMessage.content);
      setChatOpen(false);
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box>
        <Box
          sx={{
            display: chatOpen ? { xs: 'block', md: 'grid' } : 'block',
            gridTemplateColumns: { md: '1fr 400px' },
            gap: 3,
          }}
        >
        {/* LEFT: Description Panel */}
        <Card sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight={600}>
                Quick Description
              </Typography>
              {activeMode === 'ai_suggested' && (
                <Chip
                  icon={<AutoFixHighIcon />}
                  label="AI Suggested"
                  color="primary"
                  size="small"
                />
              )}
            </Box>

            <TextField
              multiline
              rows={6}
              fullWidth
              placeholder="Describe your product or let AI generate one..."
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              disabled={isGenerating}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'inherit',
                },
              }}
            />

            <Typography variant="caption" color="text.secondary">
              💡 Tip: You can always edit manually or use AI chat to refine this description.
            </Typography>

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button
                variant="contained"
                startIcon={<CheckCircleIcon />}
                onClick={handleUseAI}
                disabled={!aiSuggestion || isGenerating}
              >
                Use AI Description
              </Button>

              <Button
                variant="outlined"
                startIcon={isGenerating ? <CircularProgress size={16} /> : <RefreshIcon />}
                onClick={generateDescription}
                disabled={isGenerating || !imageUrl}
              >
                {isGenerating ? 'Generating...' : 'Regenerate'}
              </Button>

              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleWriteOwn}
                disabled={isGenerating}
              >
                Write My Own
              </Button>

              <Button
                variant="outlined"
                color="secondary"
                startIcon={<ChatIcon />}
                onClick={() => setChatOpen(!chatOpen)}
                sx={{ ml: 'auto' }}
              >
                {chatOpen ? 'Close Chat' : 'Refine with AI'}
              </Button>
            </Stack>
          </Stack>
        </Card>

        {/* RIGHT: Chatbot Panel */}
        {chatOpen && (
          <Paper
            elevation={3}
            sx={{
              p: 2,
              height: '500px',
              display: 'flex',
              flexDirection: 'column',
              position: { md: 'sticky' },
              top: { md: 20 },
              mt: { xs: 3, md: 0 },
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={600}>
                Refine with AI 🤖
              </Typography>
              <IconButton size="small" onClick={() => setChatOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Typography variant="caption" color="text.secondary" mb={2}>
              Tell me how to improve the description. Examples: "Make it shorter", "Add playful tone", "Optimize for Etsy"
            </Typography>

            {/* Chat Messages */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                mb: 2,
                p: 1,
                bgcolor: 'background.default',
                borderRadius: 1,
              }}
            >
              {chatMessages.length === 0 && (
                <Typography variant="body2" color="text.secondary" textAlign="center" mt={4}>
                  Start chatting to refine your description!
                </Typography>
              )}

              {chatMessages.map((msg, idx) => (
                <Box
                  key={idx}
                  sx={{
                    mb: 2,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: msg.role === 'user' ? 'primary.light' : 'grey.100',
                    color: msg.role === 'user' ? 'primary.contrastText' : 'text.primary',
                    ml: msg.role === 'user' ? 'auto' : 0,
                    mr: msg.role === 'user' ? 0 : 'auto',
                    maxWidth: '85%',
                  }}
                >
                  <Typography variant="body2">{msg.content}</Typography>
                </Box>
              ))}

              {isRefining && (
                <Box display="flex" alignItems="center" gap={1} p={1}>
                  <CircularProgress size={16} />
                  <Typography variant="body2" color="text.secondary">
                    Refining...
                  </Typography>
                </Box>
              )}

              <div ref={chatEndRef} />
            </Box>

            {/* Chat Input */}
            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g., Make it funnier"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendChatMessage();
                  }
                }}
                disabled={isRefining || !description}
              />
              <IconButton
                color="primary"
                onClick={handleSendChatMessage}
                disabled={isRefining || !chatInput.trim() || !description}
              >
                <SendIcon />
              </IconButton>
            </Stack>

            {/* Use This Version Button */}
            {chatMessages.length > 0 && (
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={handleUseChatVersion}
                sx={{ mt: 2 }}
                fullWidth
              >
                Use This Version
              </Button>
            )}
          </Paper>
        )}
        </Box>
      </Box>
    </Box>
  );
}
