"use client";

import * as React from "react";
import { Container, Box, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";

export default function HowItWorksSection() {
  return (
    <Box
      id="how-it-works"
      component="section"
      sx={{
        position: "relative",
        py: { xs: 8, md: 12 },
        bgcolor: "#fafafa",
        overflow: "hidden",
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          sx={{
            textAlign: "center",
            mb: { xs: 4, md: 6 },
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              mb: 2,
              color: "#0a0a0a",
            }}
          >
            How It Works
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontSize: { xs: "1.1rem", md: "1.25rem" },
              color: "#4a5568",
              maxWidth: "700px",
              mx: "auto",
            }}
          >
            Watch how easy it is to create marketplace listings with Snap2Listing
          </Typography>
        </Box>

        {/* Video Container */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          sx={{
            maxWidth: "1400px",
            mx: "auto",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
            border: "1px solid rgba(0, 0, 0, 0.1)",
          }}
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
          >
            <source src="/howitworks.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </Box>

        {/* CTA Button */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          sx={{
            textAlign: "center",
            mt: 6,
          }}
        >
          <Button
            href="/signup"
            component="a"
            variant="contained"
            size="large"
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              fontWeight: 700,
              py: 2.5,
              px: 6,
              borderRadius: "50px",
              textTransform: "none",
              fontSize: "1.25rem",
              boxShadow: "0 10px 30px rgba(102, 126, 234, 0.4)",
              transition: "all 0.3s ease",
              "&:hover": {
                background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                transform: "translateY(-3px)",
                boxShadow: "0 15px 40px rgba(102, 126, 234, 0.5)",
              },
              "&:active": {
                transform: "scale(0.97)",
              },
            }}
          >
            🟡 Start My 60-Second Listing
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
