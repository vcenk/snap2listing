"use client";

import * as React from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Grid,
  Card,
  CardContent,
  Avatar,
  Rating,
} from "@mui/material";
import { motion } from "framer-motion";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Multi-Channel Seller",
      rating: 5,
      text: "Snap2Listing has transformed my business! I can now list products across Shopify, Amazon, and Etsy 10x faster than before. The AI-generated images are incredible and my sales have increased by 40%.",
      initials: "SJ",
      color: "#6366f1",
    },
    {
      name: "Mike Chen",
      role: "E-commerce Shop Owner",
      rating: 5,
      text: "The SEO optimization alone is worth it. My listings are ranking higher across all platforms and getting more views than ever. I've saved hundreds of hours and my conversion rate has doubled!",
      initials: "MC",
      color: "#3b82f6",
    },
    {
      name: "Emma Davis",
      role: "Handmade Jewelry Seller",
      rating: 5,
      text: "I was skeptical at first, but the quality of the generated content is amazing. The titles and descriptions work perfectly on Instagram, Facebook Marketplace, and my Shopify store. Highly recommend!",
      initials: "ED",
      color: "#8b5cf6",
    },
    {
      name: "David Martinez",
      role: "Vintage Shop Owner",
      rating: 5,
      text: "The bulk upload feature is a game-changer for my vintage shop. I can now list 50+ items per day across multiple marketplaces instead of 5. The AI captures the vintage aesthetic perfectly!",
      initials: "DM",
      color: "#10b981",
    },
    {
      name: "Lisa Thompson",
      role: "Home Decor Seller",
      rating: 5,
      text: "The multi-channel export feature saves me so much time. No more manual copying and pasting between platforms! Customer support is excellent too. Worth every penny.",
      initials: "LT",
      color: "#f59e0b",
    },
    {
      name: "James Wilson",
      role: "Art & Collectibles",
      rating: 5,
      text: "As an artist selling on multiple platforms, I need my listings to look professional everywhere. Snap2Listing delivers every time. The image variants showcase my work beautifully across all marketplaces.",
      initials: "JW",
      color: "#ef4444",
    },
  ];

  return (
    <Box sx={{ py: { xs: 10, md: 14 }, bgcolor: "grey.50" }}>
      <Container maxWidth="lg">
        <Stack spacing={8}>
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Typography
              variant="h2"
              sx={{ fontSize: { xs: "2rem", md: "2.5rem" }, fontWeight: 800 }}
            >
              Loved by Sellers Worldwide
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 640 }}>
              Join thousands of successful multi-channel sellers who trust Snap2Listing
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: 0.05 * index }}
                >
                  <Card
                    elevation={0}
                    sx={{
                      height: "100%",
                      border: "1px solid",
                      borderColor: "divider",
                      transition: "all 0.25s ease",
                      "&:hover": {
                        boxShadow: 4,
                        transform: "translateY(-4px)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Stack spacing={2}>
                        <Rating value={testimonial.rating} readOnly size="small" />
                        <Typography
                          variant="body1"
                          sx={{ fontStyle: "italic", lineHeight: 1.7 }}
                        >
                          &ldquo;{testimonial.text}&rdquo;
                        </Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar
                            sx={{
                              bgcolor: testimonial.color,
                              width: 48,
                              height: 48,
                              fontWeight: 700,
                            }}
                          >
                            {testimonial.initials}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={700}>
                              {testimonial.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {testimonial.role}
                            </Typography>
                          </Box>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}
