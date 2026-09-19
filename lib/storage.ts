import fs from 'fs';
import path from 'path';
import os from 'os';
import { BlogPost, MediaItem, SiteSettings, SiteContentData } from './types';
import { DEFAULT_BLOG_POSTS } from './default-blog-posts';

const dataDir = path.join(process.cwd(), 'data');
const blogPostsFile = path.join(dataDir, 'blog-posts.json');
const siteContentFile = path.join(dataDir, 'site-content.json');
const mediaFile = path.join(dataDir, 'media.json');

// Serverless writable fallback paths (e.g. /tmp on Vercel)
const tmpDir = os.tmpdir();
const tmpSiteContentFile = path.join(tmpDir, 'donghoa-site-content.json');
const tmpBlogPostsFile = path.join(tmpDir, 'donghoa-blog-posts.json');
const tmpMediaFile = path.join(tmpDir, 'donghoa-media.json');

declare global {
  var __siteContentCache: SiteContentData | undefined;
  var __blogPostsCache: BlogPost[] | undefined;
  var __mediaCache: MediaItem[] | undefined;
}

const DEFAULT_SITE_CONTENT: SiteContentData = {
  settings: {
    siteName: 'Đông Hòa Design',
    brandName: 'ĐÔNG HÒA DESIGN',
    siteTagline: 'Thiết Kế Không Gian - Truyền Cảm Hứng Sống',
    siteDescription: 'Giải pháp thiết kế & thi công nội thất trọn gói.',
    logo: '/uploads/logo-dong-hoa-property.png',
    hotline: '0906.499.279',
    email: 'info@donghoagroup.vn',
    address: '113-115 Ung Văn Khiêm, Phường Thạnh Mỹ Tây, TP Hồ Chí Minh, Việt Nam',
    website: 'www.DongHoaGroup.vn',
    navLinks: [
      { label: 'Giới thiệu', url: '#philosophy' },
      { label: 'Phong cách thiết kế', url: '#styles' },
      { label: 'Tin tức', url: '/blog' },
      { label: 'Liên hệ', url: '#contact' }
    ],
    copyright: '© 2026 Đông Hòa Design'
  },
  hero: {
    backgroundImage: '/uploads/hero_slide_1.png',
    slides: []
  },
  philosophy: {
    tag: 'VỀ CHÚNG TÔI',
    heading: 'TẦM NHÌN VÀ SỨ MỆNH',
    description: 'Trải nghiệm sống tinh tế và đậm chất riêng.',
    image: '/uploads/clean_philosophy_photo.png',
    features: []
  },
  contact: {
    tag: 'LIÊN HỆ',
    heading: 'KẾT NỐI CÙNG ĐÔNG HÒA DESIGN',
    quote: 'Liên hệ tư vấn trực tiếp.',
    image: '/uploads/clean_contact_photo.png'
  },
  stylesOverview: {
    tag: 'CÁC SẢN PHẨM',
    heading: 'PHONG CÁCH THIẾT KẾ',
    description: 'Không gian sống tinh tế.',
    styles: []
  },
  office: {
    tag: 'VĂN PHÒNG',
    headingLine1: 'NỘI THẤT',
    headingLine2: 'VĂN PHÒNG',
    description: 'Không gian làm việc truyền cảm hứng.',
    heroImage: '/uploads/office_hero_main.png',
    colorSwatches: [],
    galleryCards: []
  }
};

export function getSiteContent(): SiteContentData {
  // 1. In-memory cache hit
  if (globalThis.__siteContentCache) {
    return globalThis.__siteContentCache;
  }

  // 2. Writable tmp directory check (updated in serverless)
  try {
    if (fs.existsSync(tmpSiteContentFile)) {
      const raw = fs.readFileSync(tmpSiteContentFile, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        globalThis.__siteContentCache = parsed;
        return parsed;
      }
    }
  } catch (e) {
    // ignore
  }

  // 3. Project bundled data file
  try {
    if (fs.existsSync(siteContentFile)) {
      const raw = fs.readFileSync(siteContentFile, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        globalThis.__siteContentCache = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading site content from disk:', err);
  }

  return DEFAULT_SITE_CONTENT;
}

export function updateSiteContent(newContent: SiteContentData): boolean {
  let saved = false;
  // Always update global memory cache immediately
  globalThis.__siteContentCache = newContent;
  saved = true;

  // Try writing to serverless writable /tmp
  try {
    fs.writeFileSync(tmpSiteContentFile, JSON.stringify(newContent, null, 2), 'utf8');
    saved = true;
  } catch (e) {
    console.warn('Could not write to tmp site content file:', e);
  }

  // Try writing to project data directory (works on local development)
  try {
    const dir = path.dirname(siteContentFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(siteContentFile, JSON.stringify(newContent, null, 2), 'utf8');
    saved = true;
  } catch (err) {
    // This is expected on Vercel serverless read-only filesystem
    console.info('Project disk is read-only (Serverless environment). Memory & tmp cache active.');
  }

  return saved;
}

export function saveSiteContent(newContent: any): boolean {
  return updateSiteContent(newContent);
}

export function getBlogPosts(): BlogPost[] {
  if (globalThis.__blogPostsCache && globalThis.__blogPostsCache.length > 0) {
    return globalThis.__blogPostsCache;
  }

  try {
    if (fs.existsSync(tmpBlogPostsFile)) {
      const raw = fs.readFileSync(tmpBlogPostsFile, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalThis.__blogPostsCache = parsed;
        return parsed;
      }
    }
  } catch (e) {
    // ignore
  }

  try {
    if (fs.existsSync(blogPostsFile)) {
      const raw = fs.readFileSync(blogPostsFile, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalThis.__blogPostsCache = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading blog posts:', err);
  }

  globalThis.__blogPostsCache = DEFAULT_BLOG_POSTS;
  return DEFAULT_BLOG_POSTS;
}

export function saveBlogPosts(posts: BlogPost[]): boolean {
  globalThis.__blogPostsCache = posts;
  let saved = false;

  try {
    fs.writeFileSync(tmpBlogPostsFile, JSON.stringify(posts, null, 2), 'utf8');
    saved = true;
  } catch (e) {
    // ignore
  }

  try {
    const dir = path.dirname(blogPostsFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(blogPostsFile, JSON.stringify(posts, null, 2), 'utf8');
    saved = true;
  } catch (err) {
    console.info('Blog posts written to memory & tmp cache.');
  }

  return saved;
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  const posts = getBlogPosts();
  return posts.find((p) => p.slug === slug);
}

export function saveBlogPost(post: BlogPost): BlogPost {
  const posts = getBlogPosts();
  const existingIndex = posts.findIndex((p) => p.id === post.id);

  if (existingIndex >= 0) {
    posts[existingIndex] = post;
  } else {
    posts.unshift(post);
  }

  saveBlogPosts(posts);
  return post;
}

export function deleteBlogPost(id: string): boolean {
  const posts = getBlogPosts();
  const filtered = posts.filter((p) => p.id !== id);
  if (filtered.length !== posts.length) {
    saveBlogPosts(filtered);
    return true;
  }
  return false;
}

export function getMediaLibrary(): MediaItem[] {
  if (globalThis.__mediaCache) {
    return globalThis.__mediaCache;
  }

  try {
    if (fs.existsSync(tmpMediaFile)) {
      const raw = fs.readFileSync(tmpMediaFile, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        globalThis.__mediaCache = parsed;
        return parsed;
      }
    }
  } catch (e) {
    // ignore
  }

  try {
    if (fs.existsSync(mediaFile)) {
      const raw = fs.readFileSync(mediaFile, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        globalThis.__mediaCache = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading media library:', err);
  }

  return [];
}

export function saveMediaLibrary(media: MediaItem[]): boolean {
  globalThis.__mediaCache = media;
  let saved = false;

  try {
    fs.writeFileSync(tmpMediaFile, JSON.stringify(media, null, 2), 'utf8');
    saved = true;
  } catch (e) {
    // ignore
  }

  try {
    const dir = path.dirname(mediaFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(mediaFile, JSON.stringify(media, null, 2), 'utf8');
    saved = true;
  } catch (err) {
    console.info('Media library written to memory & tmp cache.');
  }

  return saved;
}

export function getMediaItems(): MediaItem[] {
  return getMediaLibrary();
}

export function saveMediaItem(item: MediaItem): MediaItem {
  const media = getMediaLibrary();
  media.unshift(item);
  saveMediaLibrary(media);
  return item;
}

