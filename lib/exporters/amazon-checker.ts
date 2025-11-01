// ============================================
// AMAZON READINESS CHECKER
// ============================================
// Validates Amazon listing requirements and generates readiness report
// Author: Claude Code Migration Team
// Date: 2025-10-15

import { BaseExporter } from './base-exporter';
import { ValidationResult, ExportFile, PreflightCheck, Channel, ListingData } from '@/lib/types/channels';

export class AmazonChecker extends BaseExporter {
  validate(listing: ListingData, channel: Channel): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const content = this.getEffectiveContent(listing, channel.id);

    // Title validation (Amazon max 200 chars)
    if (!content.title) {
      errors.push('Title is required for Amazon');
    } else if (content.title.length > 200) {
      errors.push(`Amazon title max 200 characters (current: ${content.title.length})`);
    }

    // Check for promotional language in title (Amazon doesn't allow)
    const promotionalWords = ['free shipping', 'sale', 'discount', 'promo', 'best seller'];
    const lowerTitle = content.title.toLowerCase();
    promotionalWords.forEach((word) => {
      if (lowerTitle.includes(word)) {
        errors.push(`Amazon does not allow promotional language in titles: "${word}"`);
      }
    });

    // Bullet points validation (Amazon requires 5)
    if (content.bullets.length < 5) {
      errors.push(`Amazon requires exactly 5 bullet points (current: ${content.bullets.length})`);
    } else if (content.bullets.length > 5) {
      warnings.push(`Amazon recommends exactly 5 bullet points (current: ${content.bullets.length})`);
    }

    // Bullet length validation
    content.bullets.forEach((bullet, index) => {
      if (bullet.length > 255) {
        errors.push(`Bullet ${index + 1} exceeds 255 characters (current: ${bullet.length})`);
      }
      if (bullet.length < 10) {
        warnings.push(`Bullet ${index + 1} is too short (min 10 characters recommended)`);
      }
    });

    // Description validation
    if (!content.description) {
      errors.push('Description is required for Amazon');
    } else if (content.description.length < 300) {
      warnings.push('Amazon descriptions should be at least 300 characters for best results');
    }

    // Image validation (Amazon recommends 5+)
    if (content.images.length < 5) {
      warnings.push(`Amazon recommends at least 5 images (current: ${content.images.length})`);
    }

    // Price validation removed - price field is no longer used in the application

    return {
      isReady: errors.length === 0,
      isValid: errors.length === 0,
      errors,
      warnings,
      score: this.calculateScore(errors, warnings),
      channelId: channel.id,
      channelName: channel.name,
    };
  }

  async generate(listing: ListingData, channel: Channel): Promise<ExportFile> {
    const content = this.getEffectiveContent(listing, channel.id);
    const validation = this.validate(listing, channel);
    const preflights = this.getPreflightChecks(listing, channel);

    // Generate readiness report
    const report = `
═══════════════════════════════════════════════════════════
   AMAZON LISTING READINESS REPORT
═══════════════════════════════════════════════════════════

Generated: ${new Date().toISOString()}
Listing ID: ${listing.id || 'N/A'}

═══════════════════════════════════════════════════════════
   OVERALL STATUS
═══════════════════════════════════════════════════════════

Status: ${validation.isReady ? '✓ READY TO LIST' : '✗ NOT READY'}
Readiness Score: ${validation.score}/100

${validation.isReady ?
  'Your listing meets all Amazon requirements and is ready to be uploaded.' :
  'Please address the issues below before listing on Amazon.'}

${validation.errors.length > 0 ? `
═══════════════════════════════════════════════════════════
   ERRORS (Must Fix)
═══════════════════════════════════════════════════════════

${validation.errors.map((e, i) => `${i + 1}. ${e}`).join('\n')}
` : ''}

${validation.warnings.length > 0 ? `
═══════════════════════════════════════════════════════════
   WARNINGS (Recommended Fixes)
═══════════════════════════════════════════════════════════

${validation.warnings.map((w, i) => `${i + 1}. ${w}`).join('\n')}
` : ''}

═══════════════════════════════════════════════════════════
   PREFLIGHT CHECKS
═══════════════════════════════════════════════════════════

${preflights.map(check => `
[${check.status === 'pass' ? '✓' : check.status === 'warning' ? '⚠' : '✗'}] ${check.name}
    ${check.description}
    ${check.message ? `→ ${check.message}` : ''}
`).join('')}

═══════════════════════════════════════════════════════════
   LISTING DETAILS
═══════════════════════════════════════════════════════════

TITLE (${content.title.length}/200 chars):
${content.title}

BULLET POINTS (${content.bullets.length}/5):
${content.bullets.length > 0 ? content.bullets.map((b, i) => `${i + 1}. ${b} (${b.length} chars)`).join('\n') : '  None'}

DESCRIPTION (${content.description.length} chars):
${this.truncate(content.description, 500)}...

IMAGES: ${content.images.length}
${content.images.map((img, i) => `  ${i + 1}. ${img}`).join('\n')}

PRICE: $${this.formatPrice(listing.base.price)}
QUANTITY: ${listing.base.quantity || 'N/A'}
SKU: ${listing.base.sku || 'N/A'}
CATEGORY: ${listing.base.category || 'N/A'}

═══════════════════════════════════════════════════════════
   NEXT STEPS
═══════════════════════════════════════════════════════════

${validation.isReady ? `
1. Review all content one final time
2. Prepare product images (min 1000x1000px)
3. Log in to Amazon Seller Central
4. Navigate to Inventory > Add a Product
5. Select appropriate category
6. Copy content from this report to Amazon's fields
7. Upload images
8. Set pricing and inventory
9. Submit for review
` : `
1. Address all ERRORS listed above
2. Consider fixing WARNINGS for better visibility
3. Re-export this report to verify readiness
4. Once all checks pass, proceed to Amazon Seller Central
`}

═══════════════════════════════════════════════════════════
   AMAZON-SPECIFIC REQUIREMENTS
═══════════════════════════════════════════════════════════

Title Guidelines:
- Max 200 characters
- No promotional language (free shipping, sale, etc.)
- Include brand, product line, material, key features
- Use proper capitalization (not all caps)

Bullet Points Guidelines:
- Exactly 5 bullet points required
- Each 10-255 characters
- Start with capital letter
- No promotional language
- Focus on features and benefits

Image Requirements:
- Minimum 1000x1000 pixels (recommended 2000x2000)
- White or light gray background for main image
- Product must fill 85% or more of frame
- No watermarks, text, or logos
- JPEG or PNG format

Description Requirements:
- Minimum 300 characters (1000+ recommended)
- Clear, concise, benefit-focused
- Use HTML formatting for readability
- No external links or promotional content

═══════════════════════════════════════════════════════════

Report generated by Snap2Listing Multi-Channel Export Tool
For questions: https://snap2listing.com/support

═══════════════════════════════════════════════════════════
`.trim();

    return {
      fileName: `amazon-readiness-${this.slugify(content.title)}-${this.getTimestamp()}.txt`,
      contentType: 'text/plain',
      content: report,
      encoding: 'utf-8',
    };
  }

  getPreflightChecks(listing: ListingData, channel: Channel): PreflightCheck[] {
    const content = this.getEffectiveContent(listing, channel.id);

    return [
      {
        name: 'Title Length',
        description: 'Amazon titles max 200 characters',
        status: content.title.length <= 200 ? 'pass' : 'fail',
        message: content.title.length > 200 ? `Title is ${content.title.length} characters` : undefined,
      },
      {
        name: 'Promotional Language',
        description: 'Amazon prohibits promotional terms in titles',
        status: this.hasPromotionalLanguage(content.title) ? 'fail' : 'pass',
        message: this.hasPromotionalLanguage(content.title)
          ? 'Remove promotional language from title'
          : undefined,
      },
      {
        name: 'Bullet Points Count',
        description: 'Amazon requires exactly 5 bullet points',
        status: content.bullets.length === 5 ? 'pass' : 'fail',
        message: content.bullets.length !== 5 ? `Currently have ${content.bullets.length} bullets` : undefined,
      },
      {
        name: 'Bullet Points Length',
        description: 'Each bullet should be 10-255 characters',
        status: this.validateBulletLengths(content.bullets) ? 'pass' : 'fail',
        message: !this.validateBulletLengths(content.bullets)
          ? 'One or more bullets outside 10-255 character range'
          : undefined,
      },
      {
        name: 'Description Quality',
        description: 'Detailed descriptions perform better',
        status: content.description.length >= 300 ? 'pass' : 'warning',
        message:
          content.description.length < 300
            ? `Description is ${content.description.length} characters (recommended: 300+)`
            : undefined,
      },
      {
        name: 'Image Count',
        description: 'Amazon recommends 5+ high-quality images',
        status: content.images.length >= 5 ? 'pass' : 'warning',
        message: content.images.length < 5 ? `${content.images.length} images (recommended: 5+)` : undefined,
      },
      // Price preflight check removed - price field is no longer used in the application
    ];
  }

  private hasPromotionalLanguage(title: string): boolean {
    const promotionalWords = ['free shipping', 'sale', 'discount', 'promo', 'best seller', 'hot deal'];
    const lowerTitle = title.toLowerCase();
    return promotionalWords.some((word) => lowerTitle.includes(word));
  }

  private validateBulletLengths(bullets: string[]): boolean {
    return bullets.every((b) => b.length >= 10 && b.length <= 255);
  }

  private calculateScore(errors: string[], warnings: string[]): number {
    let score = 100;
    score -= errors.length * 15;
    score -= warnings.length * 5;
    return Math.max(0, Math.min(100, score));
  }
}
