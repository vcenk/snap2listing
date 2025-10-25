// ============================================
// CHANNEL VALIDATORS
// ============================================
// Validates listing content against channel-specific rules
// Author: Claude Code Migration Team
// Date: 2025-10-15

import {
  Channel,
  ListingBase,
  ChannelOverride,
  ValidationResult,
  ValidationRules,
} from '@/lib/types/channels';

export class ChannelValidator {
  constructor(private channel: Channel) {}

  /**
   * Validate listing content against channel rules
   * @param base - Base listing content
   * @param override - Channel-specific overrides (optional)
   * @returns ValidationResult with errors, warnings, and readiness score
   */
  validate(base: ListingBase, override?: ChannelOverride): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Get effective values (override takes precedence over base)
    const title = override?.title || base.title;
    const description = override?.description || base.description;
    const tags = override?.tags || [];
    const bullets = override?.bullets || [];
    const price = base.price;
    const images = base.images || [];

    // Validate title
    this.validateTitle(title, errors, warnings);

    // Validate description
    this.validateDescription(description, errors, warnings);

    // Validate tags (if applicable)
    if (this.channel.validationRules.tags) {
      this.validateTags(tags, errors, warnings);
    }

    // Validate bullets (if applicable)
    if (this.channel.validationRules.bullets) {
      this.validateBullets(bullets, errors, warnings);
    }

    // Validate price
    this.validatePrice(price, errors, warnings);

    // Validate images
    this.validateImages(images, errors, warnings);

    // Calculate readiness
    const isReady = errors.length === 0;
    const score = this.calculateReadinessScore(base, override, errors, warnings);

    return {
      isReady,
      isValid: isReady,
      errors,
      warnings,
      score,
      channelId: this.channel.id,
      channelName: this.channel.name,
    };
  }

  private validateTitle(title: string, errors: string[], warnings: string[]): void {
    const rules = this.channel.validationRules.title;
    if (!rules) return;

    if (rules.required && (!title || title.trim().length === 0)) {
      errors.push(`Title is required for ${this.channel.name}`);
      return;
    }

    if (rules.maxLength && title.length > rules.maxLength) {
      errors.push(
        `Title exceeds maximum length of ${rules.maxLength} characters for ${this.channel.name} (current: ${title.length})`
      );
    }

    if (rules.minLength && title.length < rules.minLength) {
      warnings.push(
        `Title should be at least ${rules.minLength} characters for ${this.channel.name} (current: ${title.length})`
      );
    }
  }

  private validateDescription(
    description: string,
    errors: string[],
    warnings: string[]
  ): void {
    const rules = this.channel.validationRules.description;
    if (!rules) return;

    if (rules.required && (!description || description.trim().length === 0)) {
      errors.push(`Description is required for ${this.channel.name}`);
      return;
    }

    if (rules.maxLength && description.length > rules.maxLength) {
      errors.push(
        `Description exceeds maximum length of ${rules.maxLength} characters for ${this.channel.name} (current: ${description.length})`
      );
    }

    if (rules.minLength && description.length < rules.minLength) {
      warnings.push(
        `Description should be at least ${rules.minLength} characters for ${this.channel.name} (current: ${description.length})`
      );
    }
  }

  private validateTags(tags: string[], errors: string[], warnings: string[]): void {
    const rules = this.channel.validationRules.tags;
    if (!rules) return;

    if (rules.min && tags.length < rules.min) {
      errors.push(
        `At least ${rules.min} tags required for ${this.channel.name} (current: ${tags.length})`
      );
    }

    if (rules.max && tags.length > rules.max) {
      errors.push(
        `Maximum ${rules.max} tags allowed for ${this.channel.name} (current: ${tags.length})`
      );
    }
  }

  private validateBullets(bullets: string[], errors: string[], warnings: string[]): void {
    const rules = this.channel.validationRules.bullets;
    if (!rules) return;

    if (rules.required && bullets.length === 0) {
      errors.push(`Bullet points are required for ${this.channel.name}`);
      return;
    }

    if (rules.count && bullets.length !== rules.count) {
      errors.push(
        `Exactly ${rules.count} bullet points required for ${this.channel.name} (current: ${bullets.length})`
      );
    }

    bullets.forEach((bullet, index) => {
      if (rules.maxLength && bullet.length > rules.maxLength) {
        errors.push(
          `Bullet point ${index + 1} exceeds maximum length of ${rules.maxLength} characters for ${this.channel.name}`
        );
      }

      if (rules.minLength && bullet.length < rules.minLength) {
        warnings.push(
          `Bullet point ${index + 1} should be at least ${rules.minLength} characters for ${this.channel.name}`
        );
      }
    });
  }

  private validatePrice(price: number, errors: string[], warnings: string[]): void {
    const rules = this.channel.validationRules.price;
    if (!rules) return;

    if (rules.required && (!price || price <= 0)) {
      errors.push(`Price is required for ${this.channel.name}`);
      return;
    }

    if (rules.min && price < rules.min) {
      errors.push(
        `Price must be at least $${rules.min} for ${this.channel.name} (current: $${price})`
      );
    }

    if (rules.max && price > rules.max) {
      warnings.push(
        `Price is above recommended maximum of $${rules.max} for ${this.channel.name} (current: $${price})`
      );
    }
  }

  private validateImages(images: string[], errors: string[], warnings: string[]): void {
    const rules = this.channel.validationRules.images;
    if (!rules) return;

    if (rules.min && images.length < rules.min) {
      errors.push(
        `At least ${rules.min} images required for ${this.channel.name} (current: ${images.length})`
      );
    }

    if (rules.max && images.length > rules.max) {
      warnings.push(
        `Maximum ${rules.max} images recommended for ${this.channel.name} (current: ${images.length})`
      );
    }
  }

  private calculateReadinessScore(
    base: ListingBase,
    override: ChannelOverride | undefined,
    errors: string[],
    warnings: string[]
  ): number {
    let score = 100;

    // Deduct points for errors and warnings
    score -= errors.length * 20;
    score -= warnings.length * 10;

    // Bonus points for optimization (using overrides)
    if (override) {
      if (override.title && override.title !== base.title) {
        score += 5; // Optimized title
      }
      if (override.description && override.description !== base.description) {
        score += 5; // Optimized description
      }
      if (override.tags && override.tags.length > 0) {
        score += 10; // Channel-specific tags
      }
      if (override.bullets && override.bullets.length > 0) {
        score += 10; // Channel-specific bullets
      }
    }

    // Bonus for high-quality content
    if (base.images && base.images.length >= 5) {
      score += 5; // Sufficient images
    }
    if (base.description && base.description.length >= 300) {
      score += 5; // Detailed description
    }

    return Math.max(0, Math.min(100, score));
  }
}

/**
 * Validate listing against all selected channels
 * @param channels - Array of channels to validate against
 * @param base - Base listing content
 * @param overrides - Channel-specific overrides
 * @returns Record of validation results keyed by channel ID
 */
export function validateAllChannels(
  channels: Channel[],
  base: ListingBase,
  overrides: ChannelOverride[]
): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {};

  for (const channel of channels) {
    const validator = new ChannelValidator(channel);
    const override = overrides.find((o) => o.channelId === channel.id);
    results[channel.id] = validator.validate(base, override);
  }

  return results;
}

/**
 * Get overall readiness status across all channels
 * @param validationResults - Validation results for all channels
 * @returns Overall readiness statistics
 */
export function getOverallReadiness(
  validationResults: Record<string, ValidationResult>
): {
  isAllReady: boolean;
  readyCount: number;
  totalCount: number;
  averageScore: number;
  criticalErrors: string[];
} {
  const results = Object.values(validationResults);
  const readyCount = results.filter((r) => r.isReady).length;
  const totalCount = results.length;
  const averageScore =
    results.reduce((sum, r) => sum + (r.score || 0), 0) / totalCount || 0;

  const criticalErrors: string[] = [];
  results.forEach((result) => {
    if (result.errors.length > 0) {
      criticalErrors.push(`${result.channelName}: ${result.errors.join(', ')}`);
    }
  });

  return {
    isAllReady: readyCount === totalCount,
    readyCount,
    totalCount,
    averageScore: Math.round(averageScore),
    criticalErrors,
  };
}

/**
 * Channel-specific validator implementations
 */

export class ShopifyValidator extends ChannelValidator {
  validate(base: ListingBase, override?: ChannelOverride): ValidationResult {
    const result = super.validate(base, override);

    // Shopify-specific validations
    const title = override?.title || base.title;

    // Check for excessive capitalization
    if (title === title.toUpperCase() && title.length > 10) {
      result.warnings.push(
        'Avoid using all caps in titles for Shopify (may affect SEO)'
      );
    }

    return result;
  }
}

export class EbayValidator extends ChannelValidator {
  validate(base: ListingBase, override?: ChannelOverride): ValidationResult {
    const result = super.validate(base, override);

    // eBay-specific validations
    // eBay requires condition
    if (!override?.customFields?.condition) {
      result.errors.push('Condition is required for eBay (e.g., "New", "Used")');
    }

    return result;
  }
}

export class AmazonValidator extends ChannelValidator {
  validate(base: ListingBase, override?: ChannelOverride): ValidationResult {
    const result = super.validate(base, override);

    // Amazon-specific validations
    const bullets = override?.bullets || [];

    // Amazon strongly prefers 5 bullets
    if (bullets.length !== 5) {
      result.warnings.push('Amazon recommends exactly 5 bullet points for optimal presentation');
    }

    // Check for promotional language
    const title = override?.title || base.title;
    if (title.toLowerCase().includes('free shipping') || title.toLowerCase().includes('sale')) {
      result.errors.push('Amazon does not allow promotional language in titles');
    }

    return result;
  }
}

export class EtsyValidator extends ChannelValidator {
  validate(base: ListingBase, override?: ChannelOverride): ValidationResult {
    const result = super.validate(base, override);

    // Etsy-specific validations
    const tags = override?.tags || [];

    // Etsy has specific tag requirements
    if (tags.length < 8) {
      result.errors.push('Etsy requires at least 8 tags (up to 13)');
    }

    // Check for materials
    if (!base.materials || base.materials.length === 0) {
      result.warnings.push('Adding materials helps with Etsy search visibility');
    }

    return result;
  }
}

/**
 * Factory function to create appropriate validator for channel
 */
export function createValidatorForChannel(channel: Channel): ChannelValidator {
  switch (channel.slug) {
    case 'shopify':
      return new ShopifyValidator(channel);
    case 'ebay':
      return new EbayValidator(channel);
    case 'amazon':
      return new AmazonValidator(channel);
    case 'etsy':
      return new EtsyValidator(channel);
    default:
      return new ChannelValidator(channel);
  }
}
