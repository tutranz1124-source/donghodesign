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
    siteDescription: 'Giải pháp thiết kế & thi công nội thất trọn gói, biến ngôi nhà mơ ước của bạn thành hiện thực với dấu ấn cá nhân độc bản.',
    logo: '/uploads/logo-dong-hoa-property.png',
    hotline: '0906.499.279',
    email: 'info@donghoagroup.vn',
    address: '113-115 Ung Văn Khiêm, Phường Thạnh Mỹ Tây, TP Hồ Chí Minh, Việt Nam',
    website: 'www.DongHoaGroup.vn',
    navLinks: [
      { label: 'Giới thiệu', url: '#philosophy' },
      { label: 'Phong cách thiết kế', url: '#styles' },
      { label: 'Thi công', url: '#philosophy' },
      { label: 'Tin tức', url: '/blog' },
      { label: 'Liên hệ', url: '#contact' }
    ],
    copyright: '© 2026 Đông Hòa Design - Dong Hoa Group. All rights reserved.'
  },
  hero: {
    backgroundImage: '/uploads/hero_slide_1.png',
    slides: [
      {
        tag: 'ĐÔNG HÒA DESIGN',
        monogram: 'T',
        line1: 'hiết kế không gian',
        line2: 'ruyền cảm hứng sống',
        description: 'Nội thất sang trọng được tạo nên với sự sáng tạo, tính công năng và vẻ đẹp vượt thời gian. Giải pháp thiết kế & thi công nội thất trọn gói với dấu ấn cá nhân độc bản.',
        backgroundImage: '/uploads/hero_slide_1.png',
        buttonText: 'Xem thêm',
        buttonTarget: '#contact',
        secondaryText: 'Tìm hiểu về chúng tôi →',
        secondaryTarget: '#philosophy'
      },
      {
        tag: 'ĐÔNG HÒA DESIGN',
        monogram: 'K',
        line1: 'hác biệt',
        line2: '',
        description: '100% bản vẽ chuẩn thực tế, không thiết kế ảo. Xưởng sản xuất trực tiếp – Giảm chi phí trung gian. Bảo hành 2 năm, bảo trì trọn đời.',
        backgroundImage: '/uploads/hero_slide_2.png',
        buttonText: 'Xem thêm',
        buttonTarget: '#philosophy',
        secondaryText: 'Khám phá phong cách →',
        secondaryTarget: '#styles'
      },
      {
        tag: 'ĐÔNG HÒA DESIGN',
        monogram: 'L',
        line1: 'iên hệ ngay',
        line2: '',
        description: 'Hotline: 0906.499.279 | Email: info@donghoagroup.vn | Văn phòng làm việc: 113-115 Ung Văn Khiêm, Thạnh Mỹ Tây, TP.HCM',
        backgroundImage: '/uploads/hero_slide_3.png',
        buttonText: 'Gửi yêu cầu',
        buttonTarget: '#contact',
        secondaryText: 'Xem tin tức & cẩm nang →',
        secondaryTarget: '/blog'
      }
    ]
  },
  philosophy: {
    tag: 'VỀ CHÚNG TÔI',
    heading: 'TẦM NHÌN VÀ SỨ MỆNH',
    description: 'Với những dự án đã hoàn thành (từ căn hộ cao cấp đến biệt thự, văn phòng, showroom). Đông Hòa Design tự hào mang đến trải nghiệm sống tinh tế, tiện nghi và đậm chất riêng cho từng gia chủ',
    image: '/uploads/clean_philosophy_photo.png',
    features: [
      {
        title: 'Thiết kế độc bản',
        description: 'Cá nhân hóa 100% theo phong cách và phong thủy của chủ nhà.'
      },
      {
        title: 'Thi công trọn gói',
        description: 'Đảm bảo đúng 99% so với bản vẽ 3D.'
      },
      {
        title: 'Xưởng sản xuất trực tiếp',
        description: 'Tối ưu 20–30% chi phí so với thị trường.'
      }
    ]
  },
  contact: {
    tag: 'LIÊN HỆ NGAY VỚI CHÚNG TÔI',
    heading: 'KẾT NỐI CÙNG\nĐÔNG HÒA DESIGN',
    quote: 'Để lại thông tin, đội ngũ Kiến trúc sư Đông Hòa Design sẽ liên hệ tư vấn trực tiếp và gửi báo giá chi tiết trong vòng 15 phút.',
    image: '/uploads/clean_contact_photo.png'
  },
  stylesOverview: {
    tag: 'CÁC SẢN PHẨM ĐẶC BIỆT',
    heading: 'PHONG CÁCH THIẾT KẾ',
    description: 'Dù theo đuổi nét tối giản hiện đại hay vẻ đẹp sang trọng cổ điển, không gian sống luôn cần phản ánh đúng thần thái của người sở hữu. Đó chính là chìa khóa tạo nên sự khác biệt và giá trị bền vững cho mỗi công trình.',
    styles: [
      {
        id: 'modern',
        name: 'Modern & Minimalist',
        subtitle: 'LESS IS MORE',
        description: 'Phương châm "Less is more". Đẩy cao sự tinh giản trong nội thất, chỉ giữ lại những gì thực sự cần thiết. Màu sắc dịu nhẹ (trắng, kem, xám), không gian mở và ngập tràn ánh sáng tự nhiên.',
        cardImage: '/uploads/clean_style_modern.png',
        showcaseImage: '/uploads/figma_modern_minimalist.png',
        anchor: '#modern-section'
      },
      {
        id: 'cozy',
        name: 'Cozy & Warm',
        subtitle: 'JAPANDI & NORDIC',
        description: 'Sự kết hợp hoàn hảo giữa nét tinh tế, gọn gàng của Nhật Bản và sự ấm áp, mộc mạc của Bắc Âu. Dùng nhiều chất liệu gỗ sáng màu, mây, tre, vải thô và gam màu earthy (màu đất, kem, xanh lá nhạt).',
        cardImage: '/uploads/clean_style_cozy.png',
        showcaseImage: '/uploads/figma_cozy_warm.png',
        anchor: '#cozy-section'
      },
      {
        id: 'luxury',
        name: 'Luxury & Classic',
        subtitle: 'ĐẲNG CẤP THƯỢNG LƯU',
        description: 'Đẩy tính xa hoa và sang trọng lên mức tối đa. Sử dụng các vật liệu siêu cao cấp (gỗ tự nhiên quý, đá xuyên sáng, kim loại mạ vàng, đồ thửa riêng - bespoke) với mức độ hoàn thiện tỉ mỉ.',
        cardImage: '/uploads/clean_style_luxury.png',
        showcaseImage: '/uploads/figma_luxury_classic.png',
        anchor: '#luxury-section'
      },
      {
        id: 'heritage',
        name: 'Heritage & Retro',
        subtitle: 'HOÀI NIỆM & CÔNG NGHIỆP',
        description: 'Gợi nhớ về thập niên 50 – 80. Kết hợp giữa những món đồ cũ kỹ/kỷ niệm với những gam màu vui tươi, phá cách (vàng mustard, xanh teal, cam đất). Mô phỏng lại các nhà xưởng cũ. Điểm nhấn là tường gạch trần, sàn bê tông mài, trần để lộ ống kỹ thuật, kết hợp khung sắt đen và gỗ thô tối màu.',
        cardImage: '/uploads/clean_style_heritage.png',
        showcaseImage: '/uploads/figma_heritage_retro.png',
        anchor: '#heritage-section'
      }
    ]
  },
  office: {
    tag: 'CÁC SẢN PHẨM ĐẶC BIỆT',
    headingLine1: 'NỘI THẤT',
    headingLine2: 'VĂN PHÒNG',
    description: 'Thiết kế nội thất văn phòng không chỉ là việc tạo ra một nơi làm việc thẩm mỹ và tối ưu công năng, mà còn là giải pháp kiến tạo không gian truyền cảm hứng, nâng cao hiệu suất và thể hiện trọn vẹn nét văn hóa doanh nghiệp.',
    heroImage: '/uploads/office_hero_main.png',
    colorSwatches: [
      { color: '#04092b', label: 'Deep Navy' },
      { color: '#c5a26c', label: 'Warm Gold' },
      { color: '#8c7b6c', label: 'Earthy Stone' },
      { color: '#3d4a41', label: 'Forest Sage' }
    ],
    galleryCards: [
      { id: 1, image: '/uploads/office_card_1.png', alt: 'Không gian làm việc văn phòng hiện đại' },
      { id: 2, image: '/uploads/office_card_2.png', alt: 'Khu vực làm việc cá nhân & tiếp khách' },
      { id: 3, image: '/uploads/office_card_3.png', alt: 'Module bàn làm việc linh hoạt' }
    ]
  }
};

function mergeWithDefault(content: any): SiteContentData {
  if (!content || typeof content !== 'object') return DEFAULT_SITE_CONTENT;
  return {
    ...DEFAULT_SITE_CONTENT,
    ...content,
    settings: { ...DEFAULT_SITE_CONTENT.settings, ...(content.settings || {}) },
    hero: {
      ...DEFAULT_SITE_CONTENT.hero,
      ...(content.hero || {}),
      slides: Array.isArray(content.hero?.slides) && content.hero.slides.length > 0 ? content.hero.slides : DEFAULT_SITE_CONTENT.hero.slides
    },
    philosophy: {
      ...DEFAULT_SITE_CONTENT.philosophy,
      ...(content.philosophy || {}),
      features: Array.isArray(content.philosophy?.features) && content.philosophy.features.length > 0 ? content.philosophy.features : DEFAULT_SITE_CONTENT.philosophy.features
    },
    contact: { ...DEFAULT_SITE_CONTENT.contact, ...(content.contact || {}) },
    stylesOverview: {
      ...DEFAULT_SITE_CONTENT.stylesOverview,
      ...(content.stylesOverview || {}),
      styles: Array.isArray(content.stylesOverview?.styles) && content.stylesOverview.styles.length > 0 ? content.stylesOverview.styles : DEFAULT_SITE_CONTENT.stylesOverview.styles
    },
    office: {
      ...DEFAULT_SITE_CONTENT.office,
      ...(content.office || {}),
      colorSwatches: Array.isArray(content.office?.colorSwatches) && content.office.colorSwatches.length > 0 ? content.office.colorSwatches : DEFAULT_SITE_CONTENT.office.colorSwatches,
      galleryCards: Array.isArray(content.office?.galleryCards) && content.office.galleryCards.length > 0 ? content.office.galleryCards : DEFAULT_SITE_CONTENT.office.galleryCards
    },
    stages: content.stages || DEFAULT_SITE_CONTENT.stages
  };
}

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
        const merged = mergeWithDefault(parsed);
        globalThis.__siteContentCache = merged;
        return merged;
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
        const merged = mergeWithDefault(parsed);
        globalThis.__siteContentCache = merged;
        return merged;
      }
    }
  } catch (err) {
    console.error('Error reading site content from disk:', err);
  }

  return DEFAULT_SITE_CONTENT;
}

export async function syncFileToGitHub(filePath: string, content: string | Buffer, commitMessage: string): Promise<boolean> {
  const token = process.env.GITHUB_TOKEN || process.env.ADMIN_GITHUB_TOKEN || '';
  const owner = process.env.GITHUB_OWNER || 'tutranz1124-source';
  const repo = process.env.GITHUB_REPO || 'donghodesign';
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!token) return false;

  try {
    const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
    const getRes = await fetch(getUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'DongHoa-CMS-Sync',
        Accept: 'application/vnd.github.v3+json',
      },
      cache: 'no-store',
    });

    let sha: string | undefined;
    if (getRes.ok) {
      const fileData = await getRes.json();
      sha = fileData.sha;
    }

    const base64Content = Buffer.isBuffer(content)
      ? content.toString('base64')
      : Buffer.from(content, 'utf8').toString('base64');

    const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
    const putRes = await fetch(putUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'DongHoa-CMS-Sync',
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        message: commitMessage,
        content: base64Content,
        branch,
        ...(sha ? { sha } : {}),
      }),
    });

    if (putRes.ok) {
      console.info(`[GitHub Auto-Persistence] Successfully saved ${filePath} to GitHub repository.`);
      return true;
    } else {
      const errText = await putRes.text();
      console.warn(`[GitHub Auto-Persistence] Failed to sync ${filePath}:`, errText);
      return false;
    }
  } catch (err) {
    console.error(`[GitHub Auto-Persistence] Network error syncing ${filePath}:`, err);
    return false;
  }
}

export function updateSiteContent(newContent: SiteContentData): boolean {
  const merged = mergeWithDefault(newContent);
  let saved = false;
  // Always update global memory cache immediately
  globalThis.__siteContentCache = merged;
  saved = true;

  // Try writing to serverless writable /tmp
  try {
    fs.writeFileSync(tmpSiteContentFile, JSON.stringify(merged, null, 2), 'utf8');
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
    fs.writeFileSync(siteContentFile, JSON.stringify(merged, null, 2), 'utf8');
    saved = true;
  } catch (err) {
    console.info('Project disk is read-only (Serverless environment). Memory & tmp cache active.');
  }

  // Asynchronously commit to GitHub repository for permanent serverless persistence
  syncFileToGitHub('data/site-content.json', JSON.stringify(merged, null, 2), 'chore(cms): auto-persist site-content from admin').catch(() => {});

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

  // Asynchronously commit to GitHub repository for permanent serverless persistence
  syncFileToGitHub('data/blog-posts.json', JSON.stringify(posts, null, 2), 'chore(cms): auto-persist blog-posts from admin').catch(() => {});

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

  // Asynchronously commit to GitHub repository for permanent serverless persistence
  syncFileToGitHub('data/media.json', JSON.stringify(media, null, 2), 'chore(cms): auto-persist media list from admin').catch(() => {});

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

