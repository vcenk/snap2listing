"use client";

import * as React from "react";
import Link from "next/link";
import { Box, Container, Typography, Button, Stack } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function CTASection() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        py: { xs: 10, md: 15 },
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative circles */}
      <Box
        sx={{
          position: "absolute",
          top: "-10%",
          right: "-5%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: alpha("#fff", 0.05),
          filter: "blur(40px)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-15%",
          left: "-5%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: alpha("#fff", 0.05),
          filter: "blur(40px)",
        }}
      />

      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
        <Stack spacing={4} alignItems="center" textAlign="center">
          <Typography
            variant="h2"
            sx={{ fontSize: { xs: "2rem", md: "3rem" }, fontWeight: 800 }}
          >
            Ready to Transform Your Product Listings?
          </Typography>
          <Typography
            variant="h6"
            sx={{ opacity: 0.95, maxWidth: 680, lineHeight: 1.7 }}
          >
            Join thousands of sellers creating professional listings in minutes across multiple channels.
            Start with 15 free images. No credit card required.
          </Typography>

          {/* Trust badges */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            justifyContent="center"
            alignItems="center"
            sx={{ color: "white", fontSize: "0.95rem", opacity: 0.95 }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <CheckCircleIcon sx={{ fontSize: 20 }} />
              <span>No credit card</span>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <CheckCircleIcon sx={{ fontSize: 20 }} />
              <span>15 free images</span>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <CheckCircleIcon sx={{ fontSize: 20 }} />
              <span>Cancel anytime</span>
            </Stack>
          </Stack>

          {/* CTA Buttons */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button
              component={Link}
              href="/signup"
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 999,
                bgcolor: "white",
                color: theme.palette.primary.main,
                fontWeight: 700,
                fontSize: "1rem",
                textTransform: "none",
                "&:hover": { bgcolor: "grey.100", transform: "translateY(-2px)" },
                transition: "all 0.2s ease",
                boxShadow: 4,
              }}
            >
              Get Started Free
            </Button>
            <Button
              component={Link}
              href="#pricing"
              variant="outlined"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 999,
                borderColor: "white",
                color: "white",
                fontWeight: 700,
                fontSize: "1rem",
                textTransform: "none",
                "&:hover": {
                  borderColor: "white",
                  bgcolor: alpha("#fff", 0.1),
                  transform: "translateY(-2px)",
                },
                transition: "all 0.2s ease",
              }}
            >
              View Pricing
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
