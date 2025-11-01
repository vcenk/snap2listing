import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase/server';
import { ShopifyExporter } from '@/lib/exporters/shopify-exporter';
import { EbayExporter } from '@/lib/exporters/ebay-exporter';
import { FacebookExporter } from '@/lib/exporters/facebook-exporter';
import { AmazonChecker } from '@/lib/exporters/amazon-checker';
import { BaseExporter } from '@/lib/exporters/base-exporter';
import { channelModelToChannel, listingModelToListingData, listingChannelModelToOverride } from '@/lib/types/channels';
import type { ChannelModel, ListingModel, ListingChannelModel, ListingImageModel } from '@/lib/types/channels';
import { generatePackageExport, generateWordDocument } from '@/lib/exporters/package-exporter';
import { Packer } from 'docx';

/**
 * POST /api/export
 * Generate export file for a specific channel
 * Supports multiple formats: csv, word, package (zip)
 */
export async function POST(req: NextRequest) {
  try {
    const { listingId, channelId, format = 'csv' } = await req.json();

    console.log('Export request:', { listingId, channelId, format });

    // Validation
    if (!listingId || !channelId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: listingId, channelId' },
        { status: 400 }
      );
    }

    // Fetch listing with related data
    let listingData;
    try {
      const result = await supabase
        .from('listings')
        .select('*, listing_channels(*), listing_images(*)')
        .eq('id', listingId)
        .single();
      
      listingData = result.data;
      const listingError = result.error;
      
      if (listingError || !listingData) {
        console.error('Listing fetch error:', listingError);
        return NextResponse.json(
          { success: false, error: 'Listing not found', details: listingError?.message },
          { status: 404 }
        );
      }
      
      console.log('Fetched listing data:', {
        id: listingData.id,
        hasBaseData: !!listingData.base_data,
        channelsCount: listingData.listing_channels?.length || 0,
        imagesCount: listingData.listing_images?.length || 0
      });
    } catch (fetchError) {
      console.error('Exception fetching listing:', fetchError);
      throw fetchError;
    }

    // Fetch channel data
    const { data: channelData, error: channelError } = await supabase
      .from('channels')
      .select('*')
      .eq('id', channelId)
      .single();

    if (channelError || !channelData) {
      console.error('Channel fetch error:', channelError);
      return NextResponse.json(
        { success: false, error: 'Channel not found' },
        { status: 404 }
      );
    }

    // Convert database models to TypeScript types
    let channel, listing;
    try {
      channel = channelModelToChannel(channelData as ChannelModel);
      console.log('Channel converted:', { id: channel.id, name: channel.name, slug: channel.slug });

      // Convert listing data - with null safety
      const listingChannels = (listingData.listing_channels as ListingChannelModel[] || []).map(listingChannelModelToOverride);
      const listingImages = (listingData.listing_images as ListingImageModel[] || []).map(img => ({
        id: img.id,
        listingId: img.listing_id,
        url: img.url,
        position: img.position,
        isMain: img.is_main,
        metadata: img.metadata,
        createdAt: img.created_at,
      }));

      console.log('Listing channels count:', listingChannels.length);
      console.log('Listing images count:', listingImages.length);

      listing = listingModelToListingData(
        listingData as unknown as ListingModel,
        listingChannels,
        listingImages
      );
      
      console.log('Converted listing:', {
        id: listing.id,
        hasBase: !!listing.base,
        baseTitle: listing.base?.title,
        channelsCount: listing.channels?.length || 0
      });
    } catch (conversionError) {
      console.error('Exception during data conversion:', conversionError);
      console.error('Conversion error stack:', conversionError instanceof Error ? conversionError.stack : 'No stack');
      throw conversionError;
    }

    // Select appropriate exporter based on channel slug
    let exporter: BaseExporter;
    console.log('Selecting exporter for channel:', channel.slug);
    
    switch (channel.slug) {
      case 'shopify':
        exporter = new ShopifyExporter();
        break;
      case 'ebay':
        exporter = new EbayExporter();
        break;
      case 'facebook-ig':
        exporter = new FacebookExporter();
        break;
      case 'amazon':
        exporter = new AmazonChecker();
        break;
      case 'etsy':
        // Use Shopify exporter as base for Etsy (CSV format)
        exporter = new ShopifyExporter();
        console.log('Using Shopify exporter for Etsy (compatible CSV format)');
        break;
      case 'tiktok':
        // Use Shopify exporter as base for TikTok (CSV format)
        exporter = new ShopifyExporter();
        console.log('Using Shopify exporter for TikTok (compatible CSV format)');
        break;
      default:
        console.error('No exporter found for channel:', channel.slug, channel.name);
        return NextResponse.json(
          { 
            success: false, 
            error: `Export not yet implemented for ${channel.name} (${channel.slug})`,
            availableChannels: ['shopify', 'ebay', 'facebook-ig', 'amazon', 'etsy', 'tiktok']
          },
          { status: 501 }
        );
    }

    // Validate before export
    const validation = exporter.validate(listing, channel);
    console.log('Validation result:', validation);

    if (!validation.isReady) {
      return NextResponse.json(
        {
          success: false,
          error: 'Listing validation failed',
          validation,
          details: {
            errors: validation.errors,
            warnings: validation.warnings,
            message: `Please fix the following issues: ${validation.errors.join(', ')}`
          }
        },
        { status: 400 }
      );
    }

    // Generate export based on selected format
    let exportFile: any;

    if (format === 'package' || format === 'zip') {
      // Generate comprehensive ZIP package (Word + Images + CSV)
      const csvExport = await exporter.generate(listing, channel);
      const csvContent = typeof csvExport.content === 'string' ? csvExport.content : Buffer.from(csvExport.content).toString('utf-8');
      exportFile = await generatePackageExport(listing, channel, csvContent);
    } else if (format === 'word' || format === 'docx') {
      // Generate standalone Word document with embedded images
      const wordDoc = await generateWordDocument(listing, channel);
      const wordBuffer = await Packer.toBuffer(wordDoc);
      const wordBase64 = Buffer.from(wordBuffer).toString('base64');

      exportFile = {
        content: wordBase64,
        fileName: `${listing.base.title}_${channel.name}.docx`.replace(/[^a-z0-9.-]/gi, '_'),
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      };
    } else {
      // Default: CSV/TXT format
      exportFile = await exporter.generate(listing, channel);
    }

    // Validate export file
    if (!exportFile || !exportFile.content) {
      console.error('Export file generation failed - no content returned');
      return NextResponse.json(
        { success: false, error: 'Failed to generate export file' },
        { status: 500 }
      );
    }

    // Log export
    await supabase.from('export_logs').insert({
      listing_id: listingId,
      channel_id: channelId,
      format: channel.exportFormat,
      file_name: exportFile.fileName,
      exported_data: {
        timestamp: new Date().toISOString(),
        fileSize: exportFile.content.length || 0,
      },
    });

    // Update listing_channels exported_at timestamp
    await supabase
      .from('listing_channels')
      .update({ exported_at: new Date().toISOString() })
      .eq('listing_id', listingId)
      .eq('channel_id', channelId);

    // Return export file data
    return NextResponse.json({
      success: true,
      file: {
        name: exportFile.fileName,
        content: Buffer.from(exportFile.content).toString('base64'),
        contentType: exportFile.contentType,
        encoding: exportFile.encoding,
      },
      validation,
    });
  } catch (error) {
    console.error('Export error:', error);
    console.error('Export error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed',
        details: error instanceof Error ? error.toString() : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/export/preflight
 * Get preflight checks without generating export
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const listingId = searchParams.get('listingId');
    const channelId = searchParams.get('channelId');

    if (!listingId || !channelId) {
      return NextResponse.json(
        { success: false, error: 'Missing listingId or channelId' },
        { status: 400 }
      );
    }

    // Fetch listing and channel (same as POST)
    const { data: listingData, error: listingError } = await supabase
      .from('listings')
      .select('*, listing_channels(*), listing_images(*)')
      .eq('id', listingId)
      .single();

    if (listingError || !listingData) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    const { data: channelData, error: channelError } = await supabase
      .from('channels')
      .select('*')
      .eq('id', channelId)
      .single();

    if (channelError || !channelData) {
      return NextResponse.json(
        { success: false, error: 'Channel not found' },
        { status: 404 }
      );
    }

    const channel = channelModelToChannel(channelData as ChannelModel);
    const listingChannels = (listingData.listing_channels as ListingChannelModel[]).map(listingChannelModelToOverride);
    const listingImages = (listingData.listing_images as ListingImageModel[]).map(img => ({
      id: img.id,
      listingId: img.listing_id,
      url: img.url,
      position: img.position,
      isMain: img.is_main,
      metadata: img.metadata,
      createdAt: img.created_at,
    }));

    const listing = listingModelToListingData(
      listingData as unknown as ListingModel,
      listingChannels,
      listingImages
    );

    // Get exporter
    let exporter: BaseExporter;
    switch (channel.slug) {
      case 'shopify':
        exporter = new ShopifyExporter();
        break;
      case 'ebay':
        exporter = new EbayExporter();
        break;
      case 'facebook-ig':
        exporter = new FacebookExporter();
        break;
      case 'amazon':
        exporter = new AmazonChecker();
        break;
      default:
        return NextResponse.json(
          { success: false, error: `Export not available for ${channel.name}` },
          { status: 501 }
        );
    }

    // Get validation and preflight checks
    const validation = exporter.validate(listing, channel);
    const preflightChecks = exporter.getPreflightChecks(listing, channel);

    return NextResponse.json({
      success: true,
      validation,
      preflightChecks,
    });
  } catch (error) {
    console.error('Preflight check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Preflight check failed',
      },
      { status: 500 }
    );
  }
}
