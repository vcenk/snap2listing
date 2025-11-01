// ============================================
// EBAY EXPORTER
// ============================================
// Generates eBay CSV for File Exchange or Seller Hub
// Author: Claude Code Migration Team
// Date: 2025-10-15

import { BaseExporter } from './base-exporter';
import { ValidationResult, ExportFile, PreflightCheck, Channel, ListingData } from '@/lib/types/channels';

export class EbayExporter extends BaseExporter {
  validate(listing: ListingData, channel: Channel): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const content = this.getEffectiveContent(listing, channel.id);
    const override = listing.channels.find((c) => c.channelId === channel.id);

    // Title validation (eBay has strict 80 char limit)
    if (!content.title) {
      errors.push('Title is required for eBay');
    } else if (content.title.length > 80) {
      errors.push(`eBay title max 80 characters (current: ${content.title.length})`);
    }

    // Description validation
    if (!content.description) {
      errors.push('Description is required for eBay');
    }

    // Price validation removed - price field is no longer used in the application

    // Quantity validation
    if (!listing.base.quantity || listing.base.quantity <= 0) {
      errors.push('Quantity is required for eBay');
    }

    // Condition validation (eBay requires condition)
    const condition = override?.customFields?.condition;
    if (!condition) {
      errors.push('Condition is required for eBay (e.g., "New", "Used", "Refurbished")');
    }

    // Image validation
    if (content.images.length === 0) {
      errors.push('At least one image is required for eBay');
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
    const override = listing.channels.find((c) => c.channelId === channel.id);

    const headers = [
      'Action',
      'Category',
      'StoreCategory',
      'Title',
      'Subtitle',
      'Description',
      'Condition',
      'ConditionDescription',
      'Format',
      'Duration',
      'StartPrice',
      'BuyItNowPrice',
      'Quantity',
      'Location',
      'PayPalEmail',
      'DispatchTimeMax',
      'ShippingService-1:Option',
      'ShippingService-1:Cost',
      'ReturnsAccepted',
      'RefundOption',
      'ReturnsWithin',
      'ShippingCostPaidBy',
      'PicURL',
      'C:Brand',
      'C:MPN',
      'C:UPC',
    ];

    const rows: any[][] = [
      [
        'Add', // Action
        override?.customFields?.categoryId || '', // Category
        '', // StoreCategory
        content.title, // Title (max 80 chars)
        '', // Subtitle
        this.textToHTML(content.description), // Description (HTML)
        override?.customFields?.condition || 'New', // Condition
        '', // ConditionDescription
        'FixedPrice', // Format
        'GTC', // Duration (Good Till Cancelled)
        '', // StartPrice
        this.formatPrice(listing.base.price), // BuyItNowPrice
        listing.base.quantity || 1, // Quantity
        override?.customFields?.location || 'United States', // Location
        '', // PayPalEmail
        '3', // DispatchTimeMax (3 business days)
        'ShippingMethodStandard', // ShippingService-1:Option
        override?.customFields?.shippingCost || '0.00', // ShippingService-1:Cost
        'ReturnsAccepted', // ReturnsAccepted
        'MoneyBack', // RefundOption
        'Days_30', // ReturnsWithin
        'Buyer', // ShippingCostPaidBy
        content.images[0] || '', // PicURL (first image)
        override?.customFields?.brand || '', // C:Brand
        listing.base.sku || '', // C:MPN
        '', // C:UPC
      ],
    ];

    // Use CRLF for Windows/Excel compatibility and add BOM for UTF-8
    const csvLf = this.formatCSV(headers, rows);
    const csvCrlf = csvLf.replace(/\n/g, '\r\n');
    const csvContent = '\uFEFF' + csvCrlf; // BOM + CRLF

    return {
      fileName: `ebay-${this.slugify(content.title)}-${this.getTimestamp()}.csv`,
      contentType: 'text/csv; charset=utf-8',
      content: csvContent,
      encoding: 'utf-8',
    };
  }

  getPreflightChecks(listing: ListingData, channel: Channel): PreflightCheck[] {
    const content = this.getEffectiveContent(listing, channel.id);
    const override = listing.channels.find((c) => c.channelId === channel.id);

    return [
      {
        name: 'Title Length',
        description: 'eBay enforces strict 80 character limit',
        status: content.title.length <= 80 ? 'pass' : 'fail',
        message: content.title.length > 80 ? `Title is ${content.title.length} characters (max: 80)` : undefined,
      },
      {
        name: 'Condition',
        description: 'eBay requires item condition',
        status: override?.customFields?.condition ? 'pass' : 'fail',
        message: !override?.customFields?.condition ? 'Condition must be specified' : undefined,
      },
      {
        name: 'Images',
        description: 'Multiple images increase buyer confidence',
        status: content.images.length >= 3 ? 'pass' : content.images.length >= 1 ? 'warning' : 'fail',
        message: content.images.length < 3 ? `${content.images.length} image(s) (recommended: 3+)` : undefined,
      },
      {
        name: 'Quantity',
        description: 'Quantity must be specified',
        status: listing.base.quantity && listing.base.quantity > 0 ? 'pass' : 'fail',
        message: !listing.base.quantity || listing.base.quantity <= 0 ? 'Invalid quantity' : undefined,
      },
      {
        name: 'Category',
        description: 'Category helps with visibility',
        status: override?.customFields?.categoryId ? 'pass' : 'warning',
        message: !override?.customFields?.categoryId ? 'Consider adding eBay category ID' : undefined,
      },
    ];
  }

  private calculateScore(errors: string[], warnings: string[]): number {
    let score = 100;
    score -= errors.length * 20;
    score -= warnings.length * 10;
    return Math.max(0, Math.min(100, score));
  }
}
