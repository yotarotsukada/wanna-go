import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import type { UrlMetadata } from '../lib/types';

export async function fetchUrlMetadata(url: string): Promise<UrlMetadata> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      // @ts-ignore - node-fetch v3 timeout option
      timeout: 10000
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract metadata
    const title = $('title').text().trim() || 
                 $('meta[property="og:title"]').attr('content') || 
                 $('meta[name="twitter:title"]').attr('content') || '';

    const description = $('meta[property="og:description"]').attr('content') || 
                       $('meta[name="description"]').attr('content') || 
                       $('meta[name="twitter:description"]').attr('content') || '';

    const image = $('meta[property="og:image"]').attr('content') || 
                 $('meta[name="twitter:image"]').attr('content') || '';

    const siteName = $('meta[property="og:site_name"]').attr('content') || 
                    $('meta[name="application-name"]').attr('content') || '';

    // Try to get favicon
    let favicon = $('link[rel="icon"]').attr('href') || 
                 $('link[rel="shortcut icon"]').attr('href') || 
                 '/favicon.ico';

    // Make favicon URL absolute if relative
    if (favicon && !favicon.startsWith('http')) {
      const baseUrl = new URL(url);
      favicon = new URL(favicon, baseUrl.origin).href;
    }

    return {
      url,
      title: title.substring(0, 200), // Limit length
      description: description.substring(0, 500), // Limit length
      image,
      site_name: siteName,
      favicon,
      success: true,
      error: null
    };

  } catch (error) {
    console.error('Error fetching URL metadata:', error);
    return {
      url,
      title: '',
      description: '',
      image: '',
      site_name: '',
      favicon: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}