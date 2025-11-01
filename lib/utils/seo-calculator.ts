import type { ListingBase, ChannelOverride } from '@/lib/types/channels';

/**
 * Calculate SEO score for a listing based on various factors
 * Returns a score from 0-100
 */
export function calculateSEOScore(
  baseData: ListingBase,
  channelOverrides: ChannelOverride[] = []
): number {
  let score = 0;
  const weights = {
    title: 20,
    description: 20,
    tags: 15,
    bullets: 15,
    images: 15,
    category: 10,
    materials: 5,
  };

  // Title quality (20 points)
  if (baseData.title) {
    const titleLength = baseData.title.length;
    if (titleLength >= 40 && titleLength <= 80) {
      score += weights.title; // Optimal length
    } else if (titleLength >= 20 && titleLength < 40) {
      score += weights.title * 0.7; // Good but could be longer
    } else if (titleLength > 80 && titleLength <= 120) {
      score += weights.title * 0.7; // Good but could be shorter
    } else if (titleLength > 0) {
      score += weights.title * 0.4; // Too short or too long
    }
  }

  // Description quality (20 points)
  if (baseData.description) {
    const descLength = baseData.description.length;
    if (descLength >= 200 && descLength <= 2000) {
      score += weights.description; // Optimal length
    } else if (descLength >= 100 && descLength < 200) {
      score += weights.description * 0.7; // Good but could be longer
    } else if (descLength > 2000 && descLength <= 3000) {
      score += weights.description * 0.7; // Good but could be shorter
    } else if (descLength > 0) {
      score += weights.description * 0.4; // Too short or too long
    }
  }

  // Images (15 points)
  const imageCount = baseData.images?.length || 0;
  if (imageCount >= 5) {
    score += weights.images; // 5+ images is optimal
  } else if (imageCount >= 3) {
    score += weights.images * 0.8; // 3-4 images is good
  } else if (imageCount >= 1) {
    score += weights.images * 0.5; // 1-2 images is acceptable
  }

  // Category (10 points)
  if (baseData.category && baseData.category.length > 0) {
    score += weights.category;
  }

  // Channel-specific factors (15 points for tags + 15 for bullets + 5 for materials)
  if (channelOverrides.length > 0) {
    let tagScore = 0;
    let bulletScore = 0;
    let materialScore = 0;

    channelOverrides.forEach((override) => {
      // Tags/Keywords
      const tagCount = override.tags?.length || 0;
      if (tagCount >= 10) {
        tagScore = Math.max(tagScore, weights.tags); // 10+ tags is optimal
      } else if (tagCount >= 5) {
        tagScore = Math.max(tagScore, weights.tags * 0.7); // 5-9 tags is good
      } else if (tagCount > 0) {
        tagScore = Math.max(tagScore, weights.tags * 0.4); // Some tags
      }

      // Bullet points
      const bulletCount = override.bullets?.length || 0;
      if (bulletCount >= 5) {
        bulletScore = Math.max(bulletScore, weights.bullets); // 5+ bullets is optimal
      } else if (bulletCount >= 3) {
        bulletScore = Math.max(bulletScore, weights.bullets * 0.7); // 3-4 bullets is good
      } else if (bulletCount > 0) {
        bulletScore = Math.max(bulletScore, weights.bullets * 0.4); // Some bullets
      }

      // Materials (mainly for Etsy)
      const materialCount = override.materials?.length || 0;
      if (materialCount >= 3) {
        materialScore = Math.max(materialScore, weights.materials); // 3+ materials
      } else if (materialCount > 0) {
        materialScore = Math.max(materialScore, weights.materials * 0.6); // Some materials
      }
    });

    score += tagScore + bulletScore + materialScore;
  }

  // Round to nearest integer and ensure within bounds
  return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Get SEO recommendations based on the score
 */
export function getSEORecommendations(
  baseData: ListingBase,
  channelOverrides: ChannelOverride[] = []
): string[] {
  const recommendations: string[] = [];

  // Title recommendations
  const titleLength = baseData.title?.length || 0;
  if (titleLength === 0) {
    recommendations.push('Add a product title');
  } else if (titleLength < 40) {
    recommendations.push('Expand your title to 40-80 characters for better SEO');
  } else if (titleLength > 120) {
    recommendations.push('Shorten your title to under 120 characters');
  }

  // Description recommendations
  const descLength = baseData.description?.length || 0;
  if (descLength === 0) {
    recommendations.push('Add a product description');
  } else if (descLength < 200) {
    recommendations.push('Expand your description to 200+ characters for better SEO');
  } else if (descLength > 3000) {
    recommendations.push('Consider shortening your description to under 3000 characters');
  }

  // Image recommendations
  const imageCount = baseData.images?.length || 0;
  if (imageCount === 0) {
    recommendations.push('Add product images');
  } else if (imageCount < 3) {
    recommendations.push('Add more images (recommended: 5+ images)');
  }

  // Category
  if (!baseData.category) {
    recommendations.push('Select a product category');
  }

  // Tags
  const hasTags = channelOverrides.some((override) => (override.tags?.length || 0) > 0);
  if (!hasTags) {
    recommendations.push('Add tags/keywords for better discoverability');
  }

  // Bullets
  const hasBullets = channelOverrides.some((override) => (override.bullets?.length || 0) > 0);
  if (!hasBullets) {
    recommendations.push('Add key features/bullet points');
  }

  return recommendations;
}
