// app/news/page.tsx

import { NewsItem } from '@/components/news-card';
import * as cheerio from 'cheerio'; // Make sure cheerio is installed: npm install cheerio
import { newsUrls } from './news';

// Function to fetch and parse a single news article (as previously defined)
export async function fetchAndParseNews(prop: typeof newsUrls[number]): Promise<NewsItem | null> {

  if (typeof prop === 'string') {
    // If prop is an object, handle it accordingly
    
    try {
      const response = await fetch(prop, { next: { revalidate: 3600 } }); // Revalidate every hour
      if (!response.ok) {
        console.error(
          `Failed to fetch ${prop}: ${response.status} ${response.statusText}`
        );
        return null;
      }
      const html = await response.text();
      const $ = cheerio.load(html);
  
      const title =
        $('meta[property="og:title"]').attr('content') ||
        $('meta[name="twitter:title"]').attr('content') ||
        $('title').text().trim() ||
        $('h1').first().text().trim() ||
        'Untitled News Article';
  
      const thumbnail =
        $('meta[property="og:image"]').attr('content') ||
        $('meta[name="twitter:image"]').attr('content') ||
        $('link[rel="image_src"]').attr('href') ||
        $('img.main-article-image').attr('src') ||
        $('article img').first().attr('src') ||
        '/placeholder-image.jpg';
  
      const summary =
        $('meta[property="og:description"]').attr('content') ||
        $('meta[name="twitter:description"]').attr('content') ||
        $('meta[name="description"]').attr('content') ||
        $('p.article-summary').first().text().trim() ||
        $('article p').first().text().trim() ||
        'No summary available.';
  
      const dateString =
        $('meta[property="article:published_time"]').attr('content') ||
        $('meta[name="pubdate"]').attr('content') ||
        $('time[datetime]').attr('datetime') ||
        $('.article-date').text().trim() ||
        $('.post-date').text().trim();
  
      let formattedDate = 'Unknown Date';
      if (dateString) {
        try {
          const dateObj = new Date(dateString);
          if (!isNaN(dateObj.getTime())) {
            formattedDate = dateObj.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
          }
        } catch (e) {
          console.warn(
            `Could not parse date string "${dateString}" from ${prop}. Error: ${e}`
          );
        }
      }
  
      return {
        link: prop,
        title: title,
        imageUrl: thumbnail,
        date: new Date(formattedDate),
        description:
          summary.substring(0, 180).trim() + (summary.length > 180 ? '...' : ''),
      };
    } catch (error) {
      console.error(`Error processing ${prop}:`, error);
      return null;
    }
  }

  return {
    link: prop.url,
    title: prop.title,
    imageUrl: prop.imageUrl || '/placeholder-image.jpg',
    date: prop.date,
    description: prop.description || 'No description available.',
    type: 'file'
  };

  // ... (Paste the entire fetchAndParseNews function code here) ...
}
