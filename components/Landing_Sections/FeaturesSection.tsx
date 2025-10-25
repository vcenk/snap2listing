"use client";

import * as React from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Grid,
} from "@mui/material";
import SpeedIcon from "@mui/icons-material/Speed";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ImageIcon from "@mui/icons-material/Image";
import PublishIcon from "@mui/icons-material/Publish";
import InsightsIcon from "@mui/icons-material/Insights";
import { motion } from "framer-motion";

export default function FeaturesSection() {
  const features = [
    {
      icon: <SpeedIcon sx={{ fontSize: 48 }} />,
      title: "Lightning Fast",
      desc: "Create professional listings in under 60 seconds. No more hours of manual work.",
      gradient: "linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)",
      iconBg: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
      emoji: "⚡",
    },
    {
      icon: <AutoFixHighIcon sx={{ fontSize: 48 }} />,
      title: "AI Magic",
      desc: "Smart AI generates perfect titles, descriptions, and tags automatically for every platform.",
      gradient: "linear-gradient(135deg, #A8E6CF 0%, #3EECAC 100%)",
      iconBg: "linear-gradient(135deg, #11998e, #38ef7d)",
      emoji: "✨",
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 48 }} />,
      title: "SEO Optimized",
      desc: "Rank higher with AI-powered keyword optimization tailored for each marketplace.",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      iconBg: "linear-gradient(135deg, #667eea, #764ba2)",
      emoji: "📈",
    },
    {
      icon: <ImageIcon sx={{ fontSize: 48 }} />,
      title: "Smart Images",
      desc: "Generate multiple product images, remove backgrounds, and create lifestyle shots automatically.",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      iconBg: "linear-gradient(135deg, #f093fb, #f5576c)",
      emoji: "🎨",
    },
    {
      icon: <InsightsIcon sx={{ fontSize: 48 }} />,
      title: "Real-Time Insights",
      desc: "Get instant feedback on listing quality with engagement predictions and scoring.",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      iconBg: "linear-gradient(135deg, #4facfe, #00f2fe)",
      emoji: "💡",
    },
    {
      icon: <PublishIcon sx={{ fontSize: 48 }} />,
      title: "One-Click Export",
      desc: "Export to 10+ marketplaces instantly with platform-ready files and validation.",
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      iconBg: "linear-gradient(135deg, #43e97b, #38f9d7)",
      emoji: "🚀",
    },
  ];

  return (
    <Box
      id="features"
      sx={{
        py: { xs: 10, md: 16 },
        background: "linear-gradient(180deg, #fafafa 0%, #ffffff 50%, #fafafa 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated gradient orbs */}
      <Box
        component={motion.div}
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        sx={{
          position: "absolute",
          top: "10%",
          left: "-10%",
          width: 600,
          height: 600,
          background: "radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />
      <Box
        component={motion.div}
        animate={{
          x: [0, -50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        sx={{
          position: "absolute",
          bottom: "10%",
          right: "-10%",
          width: 700,
          height: 700,
          background: "radial-gradient(circle, rgba(245, 87, 108, 0.12) 0%, transparent 70%)",
          filter: "blur(100px)",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <Stack
          spacing={3}
          alignItems="center"
          textAlign="center"
          sx={{ mb: { xs: 8, md: 12 } }}
          component={motion.div}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "2.5rem", md: "4rem" },
              fontWeight: 900,
              lineHeight: 1.1,
              maxWidth: 900,
            }}
          >
            Features that{" "}
            <Box
              component="span"
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              supercharge
            </Box>{" "}
            your listings
          </Typography>

          <Typography
            variant="h6"
            sx={{
              maxWidth: 800,
              fontSize: { xs: "1.15rem", md: "1.4rem" },
              lineHeight: 1.6,
              color: "#4a5568",
              fontWeight: 400,
            }}
          >
            Everything you need to create professional, high-converting product listings in minutes
          </Typography>
        </Stack>

        {/* Feature Cards */}
        <Grid container spacing={4}>
          {features.map((feature, i) => (
            <Grid item xs={12} sm={6} md={4} key={feature.title}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: 0.1 * i }}
                style={{ height: "100%" }}
              >
                <Box
                  component={motion.div}
                  whileHover={{ y: -12, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  sx={{
                    height: "100%",
                    borderRadius: "24px",
                    background: feature.gradient,
                    p: 0.3,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Glowing effect */}
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      background: feature.gradient,
                      filter: "blur(20px)",
                      opacity: 0.3,
                      zIndex: 0,
                    }}
                  />

                  {/* Inner card */}
                  <Box
                    sx={{
                      height: "100%",
                      background: "#ffffff",
                      borderRadius: "22px",
                      p: { xs: 3.5, md: 4 },
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    <Stack spacing={3}>
                      {/* Icon with emoji */}
                      <Box sx={{ position: "relative", width: "fit-content" }}>
                        <Box
                          component={motion.div}
                          animate={{
                            rotate: [0, 5, -5, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 3,
                          }}
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: "20px",
                            background: feature.iconBg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: `0 10px 30px ${feature.iconBg.match(/#[0-9A-F]{6}/i)?.[0]}40`,
                            position: "relative",
                          }}
                        >
                          <Box sx={{ color: "white", fontSize: 40 }}>
                            {feature.emoji}
                          </Box>
                        </Box>
                      </Box>

                      {/* Title */}
                      <Typography
                        variant="h4"
                        sx={{
                          fontSize: { xs: "1.5rem", md: "1.75rem" },
                          fontWeight: 800,
                          color: "#0a0a0a",
                        }}
                      >
                        {feature.title}
                      </Typography>

                      {/* Description */}
                      <Typography
                        variant="body1"
                        sx={{
                          fontSize: { xs: "1rem", md: "1.1rem" },
                          color: "#4a5568",
                          lineHeight: 1.7,
                        }}
                      >
                        {feature.desc}
                      </Typography>
                    </Stack>
                  </Box>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
