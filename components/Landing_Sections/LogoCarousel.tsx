"use client";

import * as React from "react";
import { Box, Container, Typography, Stack } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { motion } from "framer-motion";

// Marketplace logos and their brand colors
const marketplaces = [
  { name: "Shopify", color: "#96BF48", weight: 700 },
  { name: "Etsy", color: "#F16521", weight: 800 },
  { name: "eBay", color: "#E53238", weight: 700 },
  { name: "Amazon", color: "#FF9900", weight: 700 },
  { name: "Facebook", color: "#1877F2", weight: 700 },
  { name: "TikTok Shop", color: "#000000", weight: 800 },
  { name: "Instagram", color: "#E4405F", weight: 700 },
  { name: "Poshmark", color: "#5E2A84", weight: 700 },
  { name: "Mercari", color: "#3853DC", weight: 700 },
  { name: "Depop", color: "#FF3419", weight: 700 },
];

export default function LogoCarousel() {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 10 },
        background: "linear-gradient(180deg, #edeef2ff 10%, #ebf3fbff 50%, #f7e9e9ff 100%)",
        borderTop: "1px solid",
        borderBottom: "1px solid",
        borderColor: alpha("#E5E7EB", 0.6),
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Container maxWidth="lg" sx={{ mb: 5 }}>
        <Stack
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          spacing={1}
          alignItems="center"
          textAlign="center"
        >
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontSize: { xs: "0.9rem", md: "1rem" },
              fontWeight: 500,
              letterSpacing: "0.02em",
            }}
          >
            Export to <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>10+ marketplaces</Box> including:
          </Typography>
        </Stack>
      </Container>

      {/* Scrolling logos container */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          overflow: "hidden",
        }}
      >
        {/* Infinite scrolling container */}
        <Box
          component={motion.div}
          animate={{
            x: [0, -50 * marketplaces.length],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear",
            },
          }}
          sx={{
            display: "flex",
            gap: { xs: 6, md: 10 },
            width: "max-content",
            "&:hover": {
              animationPlayState: "paused",
            },
          }}
        >
          {/* First set of logos */}
          {marketplaces.map((marketplace, index) => (
            <Box
              key={`first-${index}`}
              component={motion.div}
              whileHover={{ scale: 1.1, y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                px: { xs: 2, md: 3 },
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: "1.5rem", md: "2rem" },
                  fontWeight: marketplace.weight,
                  color: marketplace.color,
                  whiteSpace: "nowrap",
                  textShadow: `0 2px 8px ${alpha(marketplace.color, 0.15)}`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    textShadow: `0 4px 16px ${alpha(marketplace.color, 0.3)}`,
                  },
                }}
              >
                {marketplace.name}
              </Typography>
            </Box>
          ))}

          {/* Duplicate set for seamless loop */}
          {marketplaces.map((marketplace, index) => (
            <Box
              key={`second-${index}`}
              component={motion.div}
              whileHover={{ scale: 1.1, y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                px: { xs: 2, md: 3 },
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: "1.5rem", md: "2rem" },
                  fontWeight: marketplace.weight,
                  color: marketplace.color,
                  whiteSpace: "nowrap",
                  textShadow: `0 2px 8px ${alpha(marketplace.color, 0.15)}`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    textShadow: `0 4px 16px ${alpha(marketplace.color, 0.3)}`,
                  },
                }}
              >
                {marketplace.name}
              </Typography>
            </Box>
          ))}

          {/* Third set for extra smooth scrolling */}
          {marketplaces.map((marketplace, index) => (
            <Box
              key={`third-${index}`}
              component={motion.div}
              whileHover={{ scale: 1.1, y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                px: { xs: 2, md: 3 },
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: "1.5rem", md: "2rem" },
                  fontWeight: marketplace.weight,
                  color: marketplace.color,
                  whiteSpace: "nowrap",
                  textShadow: `0 2px 8px ${alpha(marketplace.color, 0.15)}`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    textShadow: `0 4px 16px ${alpha(marketplace.color, 0.3)}`,
                  },
                }}
              >
                {marketplace.name}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Gradient fade overlays on edges */}
        <Box
          sx={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: { xs: 60, md: 120 },
            background: "linear-gradient(90deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: { xs: 60, md: 120 },
            background: "linear-gradient(270deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      </Box>

      {/* Subtle hint text */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography
          component={motion.div}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          variant="caption"
          sx={{
            textAlign: "center",
            display: "block",
            color: "text.secondary",
            fontSize: "0.85rem",
          }}
        >
          One listing, multiple marketplaces — automated by AI ✨
        </Typography>
      </Container>
    </Box>
  );
}
