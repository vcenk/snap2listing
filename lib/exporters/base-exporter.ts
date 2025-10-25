// ============================================
// BASE EXPORTER - ABSTRACT CLASS FOR ALL EXPORTERS
// ============================================
// Provides common functionality for platform-specific exporters
// Author: Claude Code Migration Team
// Date: 2025-10-15

import { ValidationResult, ExportFile, PreflightCheck, Channel, ListingData } from '@/lib/types/channels';

export abstract class BaseExporter {
  /**
   * Validate listing data against channel requirements
   * Must be implemented by each platform-specific exporter
   */
  abstract validate(listing: ListingData, channel: Channel): ValidationResult;

  /**
   * Generate export file for the channel
   * Must be implemented by each platform-specific exporter
   */
  abstract generate(listing: ListingData, channel: Channel): Promise<ExportFile>;

  /**
   * Get preflight checks for export readiness
   * Must be implemented by each platform-specific exporter
   */
  abstract getPreflightChecks(listing: ListingData, channel: Channel): PreflightCheck[];

  /**
   * Format data as CSV
   * Utility method for CSV-based exporters
   */
  protected formatCSV(headers: string[], rows: any[][]): string {
    const lines: string[] = [];

    // Add headers
    lines.push(this.escapeCSVRow(headers));

    // Add data rows
    for (const row of rows) {
      lines.push(this.escapeCSVRow(row));
    }

    return lines.join('\n');
  }

  /**
   * Escape a single CSV row
   */
  private escapeCSVRow(cells: any[]): string {
    return cells
      .map((cell) => {
        const str = String(cell ?? '');

        // If cell contains comma, quote, or newline, escape it
        if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
          // Escape quotes by doubling them
          const escaped = str.replace(/"/g, '""');
          return `"${escaped}"`;
        }

        return str;
      })
      .join(',');
  }

  /**
   * Get effective content (with overrides applied)
   */
  protected getEffectiveContent(
    listing: ListingData,
    channelId: string
  ): {
    title: string;
    description: string;
    tags: string[];
    bullets: string[];
    price: number;
    images: string[];
  } {
    const override = listing.channels.find((c) => c.channelId === channelId);

    return {
      title: override?.title || listing.base?.title || '',
      description: override?.description || listing.base?.description || '',
      tags: override?.tags || [],
      bullets: override?.bullets || [],
      price: listing.base?.price || 0,
      images: listing.base?.images || [],
    };
  }

  /**
   * Generate URL-friendly slug/handle from title
   */
  protected slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Strip HTML tags from text
   */
  protected stripHTML(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }

  /**
   * Convert plain text to HTML
   */
  protected textToHTML(text: string): string {
    return text
      .split('\n\n')
      .map((para) => `<p>${para.replace(/\n/g, '<br>')}</p>`)
      .join('');
  }

  /**
   * Truncate text to max length
   */
  protected truncate(text: string, maxLength: number, suffix: string = '...'): string {
    if (text.length <= maxLength) {
      return text;
    }

    return text.substring(0, maxLength - suffix.length) + suffix;
  }

  /**
   * Format price for export
   */
  protected formatPrice(price: number): string {
    return price.toFixed(2);
  }

  /**
   * Get timestamp for filename
   */
  protected getTimestamp(): string {
    return new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  }
}
