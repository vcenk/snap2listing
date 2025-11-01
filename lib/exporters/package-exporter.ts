import JSZip from 'jszip';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun } from 'docx';
import type { ListingData, Channel } from '@/lib/types/channels';

export interface ExportPackage {
  content: string; // base64 encoded ZIP
  fileName: string;
  contentType: string;
  format: 'zip' | 'docx' | 'pdf' | 'html';
}

/**
 * Generate a comprehensive export package
 * Includes: Word document, images folder, CSV file, and instructions
 */
export async function generatePackageExport(
  listing: ListingData,
  channel: Channel,
  csvContent?: string
): Promise<ExportPackage> {
  const zip = new JSZip();

  // 1. Generate Word document with formatted content
  const wordDoc = await generateWordDocument(listing, channel);
  const wordBuffer = await Packer.toBuffer(wordDoc);
  zip.file(`${sanitizeFileName(listing.base.title)}_${channel.name}.docx`, wordBuffer);

  // 2. Download and add all images
  const imagesFolder = zip.folder('images');
  if (imagesFolder && listing.base.images && listing.base.images.length > 0) {
    console.log(`📦 Downloading ${listing.base.images.length} images for export...`);
    for (let i = 0; i < listing.base.images.length; i++) {
      const imageUrl = listing.base.images[i];
      console.log(`⬇️ Downloading image ${i + 1}:`, imageUrl);
      try {
        const imageBlob = await downloadImage(imageUrl);
        const extension = getImageExtension(imageUrl);
        imagesFolder.file(`image_${i + 1}.${extension}`, imageBlob);
        console.log(`✅ Successfully added image ${i + 1} to ZIP`);
      } catch (error) {
        console.error(`❌ Failed to download image ${i + 1}:`, error);
        console.error('Image URL:', imageUrl);
        console.error('Error details:', error instanceof Error ? error.message : String(error));
      }
    }
  } else {
    console.warn('⚠️ No images folder or no images to export');
    console.log('Images folder exists:', !!imagesFolder);
    console.log('Images array:', listing.base.images);
  }

  // 3. Add CSV file if provided (for bulk upload)
  if (csvContent) {
    zip.file(`${channel.slug}_bulk_upload.csv`, csvContent);
  }

  // 4. Add instructions/README
  const instructions = generateInstructions(listing, channel);
  zip.file('README.txt', instructions);

  // 5. Add copy-paste content file (plain text with all content)
  const copyPasteContent = generateCopyPasteContent(listing, channel);
  zip.file('content_copy_paste.txt', copyPasteContent);

  // 6. Generate and return ZIP as ArrayBuffer (not base64)
  // The API route will convert to base64
  const zipArrayBuffer = await zip.generateAsync({ type: 'arraybuffer' });

  return {
    content: zipArrayBuffer as any,
    fileName: `${sanitizeFileName(listing.base.title)}_${channel.name}_Package.zip`,
    contentType: 'application/zip',
    format: 'zip',
  };
}

/**
 * Generate standalone Word document with embedded images
 */
export async function generateWordDocument(
  listing: ListingData,
  channel: Channel
): Promise<Document> {
  // Look for channel-specific overrides (now in channelOverrides array, not channels)
  const override = listing.channelOverrides?.find(c => c.channelId === channel.id || c.channelSlug === channel.slug);

  const title = override?.title || listing.base.title;
  const description = override?.description || listing.base.description;
  const tags = override?.tags || [];
  const bullets = override?.bullets || [];
  const materials = override?.materials || [];

  const sections: any[] = [];

  // Title
  sections.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Channel info
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Platform: ${channel.name}`,
          bold: true,
          size: 24,
        }),
      ],
      spacing: { after: 200 },
    })
  );

  // Images
  if (listing.base.images && listing.base.images.length > 0) {
    sections.push(
      new Paragraph({
        text: 'Product Images',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );

    for (let i = 0; i < Math.min(listing.base.images.length, 5); i++) {
      try {
        const imageBlob = await downloadImage(listing.base.images[i]);
        const imageBuffer = Buffer.from(await imageBlob.arrayBuffer());

        sections.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: imageBuffer,
                transformation: {
                  width: 400,
                  height: 400,
                },
                type: 'jpg',
              } as any),
            ],
            spacing: { after: 200 },
            alignment: AlignmentType.CENTER,
          })
        );
      } catch (error) {
        console.error(`Failed to embed image ${i + 1}:`, error);
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `[Image ${i + 1}: ${listing.base.images[i]}]`,
                italics: true,
              }),
            ],
            spacing: { after: 200 },
          })
        );
      }
    }
  }

  // Description
  sections.push(
    new Paragraph({
      text: 'Description',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    })
  );

  // Split description into paragraphs
  const descParagraphs = description.split('\n').filter(p => p.trim());
  descParagraphs.forEach(para => {
    sections.push(
      new Paragraph({
        text: para,
        spacing: { after: 150 },
      })
    );
  });

  // Tags
  if (tags.length > 0) {
    sections.push(
      new Paragraph({
        text: 'Tags/Keywords',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );
    sections.push(
      new Paragraph({
        text: tags.join(', '),
        spacing: { after: 200 },
      })
    );
  }

  // Bullet Points
  if (bullets.length > 0) {
    sections.push(
      new Paragraph({
        text: 'Key Features',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );
    bullets.forEach(bullet => {
      sections.push(
        new Paragraph({
          text: `• ${bullet}`,
          spacing: { after: 150 },
        })
      );
    });
  }

  // Materials
  if (materials.length > 0) {
    sections.push(
      new Paragraph({
        text: 'Materials',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );
    sections.push(
      new Paragraph({
        text: materials.join(', '),
        spacing: { after: 200 },
      })
    );
  }

  // Product Details
  sections.push(
    new Paragraph({
      text: 'Product Details',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    })
  );

  // Price and category fields removed - no longer used in the application

  if (listing.base.quantity) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Quantity: ', bold: true }),
          new TextRun({ text: String(listing.base.quantity) }),
        ],
        spacing: { after: 150 },
      })
    );
  }

  return new Document({
    sections: [
      {
        properties: {},
        children: sections,
      },
    ],
  });
}

/**
 * Generate plain text content for easy copy-paste
 */
function generateCopyPasteContent(listing: ListingData, channel: Channel): string {
  // Look for channel-specific overrides (now in channelOverrides array, not channels)
  const override = listing.channelOverrides?.find(c => c.channelId === channel.id || c.channelSlug === channel.slug);

  const title = override?.title || listing.base.title;
  const description = override?.description || listing.base.description;
  const tags = override?.tags || [];
  const bullets = override?.bullets || [];
  const materials = override?.materials || [];

  let content = `========================================\n`;
  content += `${channel.name.toUpperCase()} LISTING CONTENT\n`;
  content += `========================================\n\n`;

  content += `TITLE:\n`;
  content += `${title}\n\n`;

  content += `----------------------------------------\n\n`;

  content += `DESCRIPTION:\n`;
  content += `${description}\n\n`;

  content += `----------------------------------------\n\n`;

  if (tags.length > 0) {
    content += `TAGS/KEYWORDS (${tags.length}):\n`;
    content += tags.join(', ') + '\n\n';
    content += `----------------------------------------\n\n`;
  }

  if (bullets.length > 0) {
    content += `KEY FEATURES:\n`;
    bullets.forEach((bullet, i) => {
      content += `${i + 1}. ${bullet}\n`;
    });
    content += `\n----------------------------------------\n\n`;
  }

  if (materials.length > 0) {
    content += `MATERIALS:\n`;
    content += materials.join(', ') + '\n\n';
    content += `----------------------------------------\n\n`;
  }

  content += `PRODUCT DETAILS:\n`;
  // Price and category fields removed - no longer used in the application
  if (listing.base.quantity) content += `Quantity: ${listing.base.quantity}\n`;

  content += `\n========================================\n`;
  content += `IMAGE FILES:\n`;
  content += `See 'images' folder in this package\n`;
  content += `Total images: ${listing.base.images?.length || 0}\n`;
  content += `========================================\n`;

  return content;
}

/**
 * Generate README with instructions
 */
function generateInstructions(listing: ListingData, channel: Channel): string {
  return `
╔═══════════════════════════════════════════════════════════╗
║           ${channel.name.toUpperCase()} LISTING EXPORT PACKAGE                ║
╚═══════════════════════════════════════════════════════════╝

📦 PACKAGE CONTENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 📄 Word Document (.docx)
   - Formatted listing with embedded images
   - Professional layout
   - Ready to print or edit

2. 🖼️ Images Folder
   - All product images in high quality
   - Numbered sequentially (image_1, image_2, etc.)
   - Ready to upload to ${channel.name}

3. 📋 CSV File (if applicable)
   - Bulk upload format for ${channel.name}
   - Import directly to your store
   - Includes all product data

4. 📝 Content Copy-Paste File (content_copy_paste.txt)
   - Plain text format
   - Easy copy-paste sections
   - All content organized by field

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 HOW TO USE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OPTION 1: Upload Images Individually
1. Go to ${channel.name} product creation page
2. Upload images from the 'images' folder
3. Copy content from 'content_copy_paste.txt'
4. Paste into appropriate fields

OPTION 2: Use Word Document
1. Open the .docx file
2. Use it as reference for manual listing
3. Copy sections as needed
4. Download images from document if needed

OPTION 3: Bulk Upload (if CSV provided)
1. Go to ${channel.name} bulk upload tool
2. Upload the CSV file
3. Upload images separately through ${channel.name} interface
4. Match image files to products

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 LISTING SUMMARY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Title: ${listing.base.title}
Platform: ${channel.name}
Images: ${listing.base.images?.length || 0} total
Tags: ${listing.channelOverrides?.find(c => c.channelId === channel.id)?.tags?.length || 0} keywords
SEO Score: ${listing.seoScore || 0}%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 TIPS FOR BEST RESULTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Upload all images in the order they appear (image_1 first)
✓ Use the exact title and description for best SEO
✓ Add all tags/keywords to maximize discoverability
✓ Review and adjust pricing based on your costs
✓ Check ${channel.name} policies before publishing

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generated by Snap2Listing
AI-Powered Multi-Channel Product Listings
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
}

/**
 * Download image from URL and return as Blob
 */
async function downloadImage(url: string): Promise<Blob> {
  try {
    // Try direct fetch first
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Snap2Listing/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const blob = await response.blob();

    if (blob.size === 0) {
      throw new Error('Downloaded blob is empty (0 bytes)');
    }

    console.log(`✓ Downloaded image: ${blob.size} bytes, type: ${blob.type}`);
    return blob;
  } catch (error) {
    console.error('Fetch failed, error:', error);
    throw error;
  }
}

/**
 * Get file extension from image URL
 */
function getImageExtension(url: string): string {
  const match = url.match(/\.(jpg|jpeg|png|gif|webp|bmp)(\?|$)/i);
  return match ? match[1].toLowerCase() : 'jpg';
}

/**
 * Sanitize filename for safe file system usage
 */
function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .substring(0, 50)
    .toLowerCase();
}
