// ============================================
// FACEBOOK/INSTAGRAM EXPORTER
// ============================================
// Generates Facebook Product Catalog CSV
// Author: Claude Code Migration Team
// Date: 2025-10-15

import { BaseExporter } from './base-exporter';
import { ValidationResult, ExportFile, PreflightCheck, Channel, ListingData } from '@/lib/types/channels';

export class FacebookExporter extends BaseExporter {
  validate(listing: ListingData, channel: Channel): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const content = this.getEffectiveContent(listing, channel.id);

    // Title validation
    if (!content.title) {
      errors.push('Title is required for Facebook/Instagram');
    } else if (content.title.length > 150) {
      warnings.push('Facebook title recommended max 150 characters');
    }

    // Description validation
    if (!content.description) {
      errors.push('Description is required for Facebook/Instagram');
    }

    // Price validation removed - price field is no longer used in the application

    // Image validation
    if (content.images.length === 0) {
      errors.push('At least one image is required for Facebook/Instagram');
    }

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
    const productId = listing.id || this.slugify(content.title);

    const headers = [
      'id',
      'title',
      'description',
      'availability',
      'condition',
      'price',
      'link',
      'image_link',
      'brand',
      'google_product_category',
      'fb_product_category',
      'quantity_to_sell_on_facebook',
      'sale_price',
      'sale_price_effective_date',
      'item_group_id',
      'gender',
      'color',
      'size',
      'age_group',
      'material',
      'pattern',
      'shipping',
      'shipping_weight',
    ];

    const rows: any[][] = [
      [
        productId, // id
        content.title, // title
        this.stripHTML(content.description), // description
        'in stock', // availability
        'new', // condition
        `${this.formatPrice(listing.base.price)} USD`, // price
        '', // link (product URL - optional)
        content.images[0] || '', // image_link
        '', // brand
        listing.base.category || '', // google_product_category
        '', // fb_product_category
        listing.base.quantity || 999, // quantity_to_sell_on_facebook
        '', // sale_price
        '', // sale_price_effective_date
        '', // item_group_id
        '', // gender
        '', // color
        '', // size
        '', // age_group
        listing.base.materials?.join(', ') || '', // material
        '', // pattern
        '', // shipping
        '', // shipping_weight
      ],
    ];

    // Use CRLF for Windows/Excel compatibility and add BOM for UTF-8
    const csvLf = this.formatCSV(headers, rows);
    const csvCrlf = csvLf.replace(/\n/g, '\r\n');
    const csvContent = '\uFEFF' + csvCrlf; // BOM + CRLF

    return {
      fileName: `facebook-instagram-${this.slugify(content.title)}-${this.getTimestamp()}.csv`,
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
        description: 'Concise titles perform better on social',
        status: content.title.length <= 150 ? 'pass' : 'warning',
        message:
          content.title.length > 150
            ? `Title is ${content.title.length} characters (recommended: ≤150)`
            : undefined,
      },
      {
        name: 'Description',
        description: 'Clear description helps conversion',
        status: content.description.length >= 100 ? 'pass' : 'warning',
        message:
          content.description.length < 100
            ? 'Consider adding more detail to description'
            : undefined,
      },
      {
        name: 'Images',
        description: 'High-quality images critical for social commerce',
        status: content.images.length >= 3 ? 'pass' : content.images.length >= 1 ? 'warning' : 'fail',
        message:
          content.images.length < 3
            ? `${content.images.length} image(s) (recommended: 3+)`
            : undefined,
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
