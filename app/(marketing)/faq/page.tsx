'use client';

import { Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails, Chip } from '@mui/material';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    category: 'General',
    questions: [
      {
        q: 'What is Snap2Listing?',
        a: 'Snap2Listing is an AI-powered multi-channel listing generator that helps online sellers create professional product listings for multiple marketplace platforms. It generates mockups, images, SEO-optimized content, and export packages automatically.'
      },
      {
        q: 'Which marketplaces are supported?',
        a: 'We support Etsy, Shopify, Amazon, eBay, TikTok Shop, Facebook Marketplace, and more. Each platform gets channel-specific content optimized for its search algorithm and requirements.'
      },
      {
        q: 'Do I need design skills to use Snap2Listing?',
        a: 'No! That\'s the beauty of Snap2Listing. Our AI handles mockup generation, image creation, and content writing automatically. You just upload your artwork or product images, and we do the rest.'
      },
      {
        q: 'How long does it take to create a listing?',
        a: 'A complete listing with mockups, images, and optimized content can be generated in 5-10 minutes, compared to hours of manual work. POD listings with mockups take slightly longer but still under 15 minutes.'
      }
    ]
  },
  {
    category: 'Print-on-Demand (POD)',
    questions: [
      {
        q: 'What POD products are supported?',
        a: 'We support all major POD items including t-shirts, hoodies, mugs, posters, canvas prints, throw blankets, pillows, phone cases, tote bags, and more. We have 1000+ mockup templates available via Dynamic Mockups integration.'
      },
      {
        q: 'How does mockup generation work?',
        a: 'Upload your artwork design once, then select from available product templates (t-shirt, mug, etc.). Our system uses Dynamic Mockups technology to automatically place your design on professional product mockups. You can generate up to 10 mockups per listing.'
      },
      {
        q: 'Can the AI detect what product type I\'m creating?',
        a: 'Yes! Our AI analyzes the mockup images to automatically detect the product type (t-shirt, mug, poster, etc.) and the artwork theme. This ensures accurate materials, features, and descriptions specific to that product.'
      },
      {
        q: 'Are POD mockups different from regular images?',
        a: 'Yes. POD mockups show your custom design on actual products (like a t-shirt with your graphic). This is different from uploading photos of existing inventory. The POD workflow is specifically designed for sellers who create custom products on-demand.'
      }
    ]
  },
  {
    category: 'AI & Content Generation',
    questions: [
      {
        q: 'How does the AI generate content?',
        a: 'We use GPT-4 Vision to analyze your product images. The AI detects the product type, identifies the design theme and colors, then generates SEO-optimized titles, descriptions, tags, key features, and materials specific to both the product and the marketplace you\'re targeting.'
      },
      {
        q: 'Can I edit the AI-generated content?',
        a: 'Absolutely! The AI provides a strong starting point, but you have full control to edit any titles, descriptions, tags, or other fields. You can also customize content differently for each marketplace channel.'
      },
      {
        q: 'What if the AI generates incorrect information?',
        a: 'While our AI is highly accurate, you should always review generated content before publishing. The editing interface makes it easy to correct any inaccuracies. You\'re responsible for ensuring all content is accurate before publishing to marketplaces.'
      },
      {
        q: 'Does the AI understand different product types?',
        a: 'Yes! The AI generates product-specific content. For example, it will suggest "100% cotton" for t-shirts, "ceramic" for mugs, and "premium canvas" for wall art. Features are also tailored to each product type.'
      }
    ]
  },
  {
    category: 'Export & Publishing',
    questions: [
      {
        q: 'What formats can I export listings in?',
        a: 'You can export as ZIP packages (containing Word docs, CSVs, and images), standalone Word documents (.docx), or CSV files for bulk upload. Each format is optimized for easy importing to marketplace platforms.'
      },
      {
        q: 'What\'s included in the ZIP export package?',
        a: 'ZIP packages include: (1) Formatted Word document with all content, (2) All product images in high quality, (3) CSV file for bulk upload, (4) Plain text copy-paste file, and (5) README with instructions.'
      },
      {
        q: 'Can I upload the CSV directly to marketplaces?',
        a: 'Yes! Our CSV files are formatted to match each marketplace\'s bulk upload requirements. You can import them directly using each platform\'s bulk listing tools.'
      },
      {
        q: 'Do you publish listings automatically?',
        a: 'Currently, we focus on generating and exporting listing content. You download the package and upload to your marketplace manually or via their bulk upload tools. Direct API publishing may be added in the future for select platforms.'
      }
    ]
  },
  {
    category: 'Pricing & Plans',
    questions: [
      {
        q: 'Is there a free trial?',
        a: 'Check our pricing page for current trial offers. We typically offer limited free listings so you can test the service before subscribing.'
      },
      {
        q: 'What are the usage limits?',
        a: 'Each subscription plan has limits on listings created per month, mockups generated, images created, and marketplace channels supported. See our pricing page for specific plan details.'
      },
      {
        q: 'Can I upgrade or downgrade my plan?',
        a: 'Yes! You can change your plan at any time from your account settings. Upgrades take effect immediately, while downgrades take effect at the end of your current billing period.'
      },
      {
        q: 'Do you offer refunds?',
        a: 'Subscription fees are generally non-refundable, but we handle refund requests on a case-by-case basis. Contact support@snap2listing.com if you have concerns.'
      }
    ]
  },
  {
    category: 'Technical & Support',
    questions: [
      {
        q: 'What image formats are supported?',
        a: 'We support JPG, PNG, and WEBP formats. For best results, use high-resolution images (at least 1000x1000 pixels) with good lighting and clear product visibility.'
      },
      {
        q: 'Can I save my work and come back later?',
        a: 'Yes! Your listings are automatically saved as drafts. You can exit at any time and resume where you left off. When editing saved listings, all your content and images are preserved.'
      },
      {
        q: 'How do I edit an existing listing?',
        a: 'Go to your Listings page, find the listing you want to edit, and click "Edit". You\'ll see tab navigation to jump between Images, Content Details, Tags & Materials, and Review sections. All data is preserved when navigating between sections.'
      },
      {
        q: 'I found a bug or have a feature request. How do I report it?',
        a: 'Please email us at snap2listing@gmail.com with details about the bug or your feature suggestion. We actively collect user feedback to improve the platform.'
      }
    ]
  }
];

export default function FAQPage() {
  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 2,
        }}
      >
        <Container maxWidth="lg">
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Snap2Listing
            </Typography>
          </Link>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 8 }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h1" gutterBottom sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' }, fontWeight: 800 }}>
            Frequently Asked Questions
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Find quick answers to common questions about Snap2Listing
          </Typography>
        </Box>

        {/* FAQs by Category */}
        {faqs.map((category, catIndex) => (
          <Box key={catIndex} sx={{ mb: 4 }}>
            <Chip
              label={category.category}
              color="primary"
              sx={{ mb: 2, fontWeight: 600, fontSize: '0.9rem' }}
            />
            {category.questions.map((faq, qIndex) => (
              <Accordion
                key={qIndex}
                sx={{
                  mb: 1,
                  '&:before': { display: 'none' },
                  boxShadow: 1
                }}
              >
                <AccordionSummary expandIcon={<ChevronDown />}>
                  <Typography variant="h6" fontWeight={600}>
                    {faq.q}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" color="text.secondary">
                    {faq.a}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        ))}

        {/* Contact Section */}
        <Box sx={{ mt: 8, p: 4, bgcolor: 'info.50', borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Still have questions?
          </Typography>
          <Typography variant="body1" paragraph>
            Can't find the answer you're looking for? We're here to help!
          </Typography>
          <Link href="/contact" style={{ textDecoration: 'none' }}>
            <Box
              component="button"
              sx={{
                px: 4,
                py: 1.5,
                mt: 1,
                bgcolor: 'primary.main',
                color: 'white',
                border: 'none',
                borderRadius: 2,
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              Contact Support
            </Box>
          </Link>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Email: snap2listing@gmail.com
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
