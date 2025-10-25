"use client";

import * as React from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { motion } from "framer-motion";

export default function FAQSection() {
  const faqs = [
    {
      question: "How does the AI generate images?",
      answer:
        "Our AI analyzes your product photo and creates variations with different angles, backgrounds, and styles optimized for multiple marketplaces. Each image is automatically enhanced for maximum visual appeal across all platforms.",
    },
    {
      question: "Can I edit the AI-generated content?",
      answer:
        "Absolutely! You have full control to edit titles, descriptions, tags, materials, and images before exporting. Our AI provides a great starting point that you can customize to match your brand voice and each platform's requirements.",
    },
    {
      question: "How long does it take to generate a listing?",
      answer:
        "The entire process takes under 5 minutes from upload to export-ready listing. The AI generates all content (images, title, description, tags) in seconds, and you can review and download immediately for any marketplace.",
    },
    {
      question: "Which marketplaces are supported?",
      answer:
        "Snap2Listing supports 10+ marketplaces including Shopify, Etsy, eBay, Amazon, Facebook Marketplace, Instagram Shopping, TikTok Shop, Poshmark, Mercari, and Depop. Each listing is optimized for your chosen platform's specific requirements.",
    },
    {
      question: "What file formats are supported?",
      answer:
        "We support JPG, PNG, and HEIC image formats for uploads. Generated images can be downloaded in JPG or PNG format, and you can export listings as CSV or JSON files compatible with all major marketplaces.",
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer:
        "Yes, you can cancel your subscription at any time from your account settings. No questions asked, and you'll retain access until the end of your billing period.",
    },
    {
      question: "How accurate is the SEO optimization?",
      answer:
        "Our AI is trained on millions of successful listings across multiple marketplaces and continuously updated with current search trends. We analyze top-performing keywords, optimal title structure, and tag combinations for each platform to maximize your listing visibility.",
    },
    {
      question: "Can I use Snap2Listing for multiple shops?",
      answer:
        "Yes! Business plan users can manage multiple shops across different marketplaces from a single Snap2Listing account. Create once, export to any platform with optimized content for each.",
    },
  ];

  return (
    <Box id="faq" sx={{ py: { xs: 10, md: 14 }, bgcolor: "background.paper" }}>
      <Container maxWidth="md">
        <Stack spacing={6}>
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Typography
              variant="h2"
              sx={{ fontSize: { xs: "2rem", md: "2.5rem" }, fontWeight: 800 }}
            >
              Frequently Asked Questions
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 640 }}>
              Everything you need to know about Snap2Listing
            </Typography>
          </Stack>

          <Box>
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.3, delay: 0.03 * index }}
              >
                <Accordion
                  elevation={0}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    mb: 1.5,
                    borderRadius: 2,
                    "&:before": { display: "none" },
                    "&:first-of-type": { borderRadius: 2 },
                    "&:last-of-type": { borderRadius: 2 },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ px: 3, py: 1.5 }}
                  >
                    <Typography variant="subtitle1" fontWeight={700}>
                      {faq.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 3, pb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </motion.div>
            ))}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
