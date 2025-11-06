// ============================================
// SHOPIFY EXPORTER
// ============================================
// Generates Shopify CSV for bulk product upload
// Author: Claude Code Migration Team
// Date: 2025-10-15

import { BaseExporter } from './base-exporter';
import { ValidationResult, ExportFile, PreflightCheck, Channel, ListingData } from '@/lib/types/channels';

export class ShopifyExporter extends BaseExporter {
  validate(listing: ListingData, channel: Channel): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const content = this.getEffectiveContent(listing, channel.id);

    // Title validation
    if (!content.title || content.title.trim().length === 0) {
      warnings.push('Title is missing or empty - will use placeholder');
    } else if (content.title.length > 255) {
      errors.push('Shopify title max 255 characters');
    }

    // Description validation
    if (!content.description || content.description.trim().length === 0) {
      warnings.push('Description is missing - will use placeholder');
    }

    // Price validation removed - price field is no longer used in the application

    // Image validation
    if (!content.images || content.images.length === 0) {
      warnings.push('No images found - at least one image recommended for Shopify');
    }

    return {
      isReady: true, // Allow export even with warnings
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
    const handle = this.slugify(content.title);

    const headers = [
      'Handle',
      'Title',
      'Body (HTML)',
      'Vendor',
      'Type',
      'Tags',
      'Published',
      'Option1 Name',
      'Option1 Value',
      'Variant SKU',
      'Variant Grams',
      'Variant Inventory Tracker',
      'Variant Inventory Qty',
      'Variant Inventory Policy',
      'Variant Fulfillment Service',
      'Variant Price',
      'Variant Compare At Price',
      'Variant Requires Shipping',
      'Variant Taxable',
      'Variant Barcode',
      'Image Src',
      'Image Position',
      'Image Alt Text',
      'Gift Card',
      'SEO Title',
      'SEO Description',
      'Google Shopping / Google Product Category',
      'Google Shopping / Gender',
      'Google Shopping / Age Group',
      'Google Shopping / MPN',
      'Google Shopping / AdWords Grouping',
      'Google Shopping / AdWords Labels',
      'Google Shopping / Condition',
      'Google Shopping / Custom Product',
      'Google Shopping / Custom Label 0',
      'Google Shopping / Custom Label 1',
      'Google Shopping / Custom Label 2',
      'Google Shopping / Custom Label 3',
      'Google Shopping / Custom Label 4',
      'Variant Image',
      'Variant Weight Unit',
      'Variant Tax Code',
      'Cost per item',
      'Status',
    ];

    const rows: any[][] = [];

    // Use imageMetadata if available (includes alt text), otherwise fall back to images array
    const useMetadata = listing.base.imageMetadata && listing.base.imageMetadata.length > 0;
    const imagesToProcess = useMetadata
      ? listing.base.imageMetadata
      : content.images.length > 0
      ? content.images.map((url, idx) => ({ url, altText: content.title, position: idx }))
      : [{ url: '', altText: content.title, position: 0 }];

    imagesToProcess.forEach((imageData, index) => {
      const isFirstRow = index === 0;
      const imageUrl = typeof imageData === 'string' ? imageData : imageData.url;
      const imageAlt = typeof imageData === 'string' ? content.title : (imageData.altText || content.title);

      rows.push([
        isFirstRow ? handle : '', // Handle (only first row)
        isFirstRow ? content.title : '', // Title
        isFirstRow ? this.textToHTML(content.description) : '', // Body (HTML)
        '', // Vendor
        listing.base.category || '', // Type
        isFirstRow ? content.tags.join(', ') : '', // Tags
        'true', // Published
        'Title', // Option1 Name
        'Default Title', // Option1 Value
        listing.base.sku || '', // Variant SKU
        '', // Variant Grams
        '', // Variant Inventory Tracker
        isFirstRow ? (listing.base.quantity || 999) : '', // Variant Inventory Qty
        'deny', // Variant Inventory Policy
        'manual', // Variant Fulfillment Service
        isFirstRow ? this.formatPrice(listing.base.price) : '', // Variant Price
        '', // Variant Compare At Price
        'true', // Variant Requires Shipping
        'true', // Variant Taxable
        '', // Variant Barcode
        imageUrl, // Image Src
        index + 1, // Image Position
        imageAlt, // Image Alt Text (now using proper alt text!)
        'false', // Gift Card
        isFirstRow ? content.title : '', // SEO Title
        isFirstRow ? this.truncate(this.stripHTML(content.description), 320) : '', // SEO Description
        '', // Google Shopping / Google Product Category
        '', // Google Shopping / Gender
        '', // Google Shopping / Age Group
        '', // Google Shopping / MPN
        '', // Google Shopping / AdWords Grouping
        '', // Google Shopping / AdWords Labels
        'new', // Google Shopping / Condition
        'false', // Google Shopping / Custom Product
        '', // Google Shopping / Custom Label 0
        '', // Google Shopping / Custom Label 1
        '', // Google Shopping / Custom Label 2
        '', // Google Shopping / Custom Label 3
        '', // Google Shopping / Custom Label 4
        '', // Variant Image
        'kg', // Variant Weight Unit
        '', // Variant Tax Code
        '', // Cost per item
        'active', // Status
      ]);
    });

    // Use CRLF for Windows/Excel compatibility and add BOM for UTF-8
    const csvLf = this.formatCSV(headers, rows);
    const csvCrlf = csvLf.replace(/\n/g, '\r\n');
    const csvContent = '\uFEFF' + csvCrlf; // BOM + CRLF

    return {
      fileName: `shopify-${handle}-${this.getTimestamp()}.csv`,
      contentType: 'text/csv; charset=utf-8',
      content: csvContent,
      encoding: 'utf-8',
    };
  }

  getPreflightChecks(listing: ListingData, channel: Channel): PreflightCheck[] {
    const content = this.getEffectiveContent(listing, channel.id);

    return [
      {
        name: 'Title Length',
        description: 'Title should be descriptive but not too long',
        status: content.title.length <= 70 ? 'pass' : content.title.length <= 255 ? 'warning' : 'fail',
        message:
          content.title.length > 70
            ? `Title is ${content.title.length} characters (recommended: ≤70, max: 255)`
            : undefined,
      },
      {
        name: 'Images',
        description: 'Multiple images improve conversion',
        status: content.images.length >= 3 ? 'pass' : content.images.length >= 1 ? 'warning' : 'fail',
        message:
          content.images.length < 3
            ? `${content.images.length} image(s) (recommended: 3+)`
            : undefined,
      },
      {
        name: 'Description Length',
        description: 'Detailed descriptions perform better',
        status: content.description.length >= 200 ? 'pass' : 'warning',
        message:
          content.description.length < 200
            ? `Description is ${content.description.length} characters (recommended: 200+)`
            : undefined,
      },
      {
        name: 'Tags',
        description: 'Tags help with store navigation',
        status: content.tags.length >= 3 ? 'pass' : 'warning',
        message: content.tags.length < 3 ? 'Consider adding more tags for better discoverability' : undefined,
      },
      // Price preflight check removed - price field is no longer used in the application
    ];
  }

  private calculateScore(errors: string[], warnings: string[]): number {
    let score = 100;
    score -= errors.length * 20;
    score -= warnings.length * 10;
    return Math.max(0, Math.min(100, score));
  }
}
