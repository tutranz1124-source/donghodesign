import { NextRequest, NextResponse } from 'next/server';
import { getLandingPages, saveLandingPages, getLandingPageStats } from '@/lib/storage';
import { LandingPageItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB limit per HTML file

// Clean and normalize slug
function sanitizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// 1. GET: Fetch list of landing pages + storage stats
export async function GET() {
  try {
    const pages = getLandingPages();
    const stats = getLandingPageStats();
    return NextResponse.json({ pages, stats });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to read landing pages', details: error.message }, { status: 500 });
  }
}

// 2. POST: Create a new landing page
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, slug, type, htmlContent, proxyUrl, isActive = true } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Vui lòng nhập tiêu đề cho Landing Page' }, { status: 400 });
    }

    const cleanSlug = sanitizeSlug(slug || title);
    if (!cleanSlug) {
      return NextResponse.json({ error: 'Đường dẫn (Slug) không hợp lệ' }, { status: 400 });
    }

    const pages = getLandingPages();

    // Check slug collision
    if (pages.some((p) => p.slug === cleanSlug)) {
      return NextResponse.json({ error: `Đường dẫn "${cleanSlug}" đã tồn tại. Vui lòng chọn đường dẫn khác.` }, { status: 400 });
    }

    let fileSize = 0;

    if (type === 'html_upload') {
      if (!htmlContent || typeof htmlContent !== 'string' || !htmlContent.trim()) {
        return NextResponse.json({ error: 'Vui lòng tải lên nội dung file HTML của Landing Page' }, { status: 400 });
      }
      fileSize = Buffer.byteLength(htmlContent, 'utf8');

      if (fileSize > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: `Dung lượng file HTML (${(fileSize / 1024 / 1024).toFixed(2)} MB) vượt quá giới hạn an toàn 2 MB của hệ thống.`
          },
          { status: 400 }
        );
      }
    } else if (type === 'proxy_url') {
      if (!proxyUrl || !/^https?:\/\/.+/i.test(proxyUrl.trim())) {
        return NextResponse.json({ error: 'Vui lòng nhập đường link LadiPage hợp lệ (bắt đầu bằng http:// hoặc https://)' }, { status: 400 });
      }
      fileSize = 0;
    } else {
      return NextResponse.json({ error: 'Loại Landing Page không hợp lệ' }, { status: 400 });
    }

    const newPage: LandingPageItem = {
      id: `lp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim(),
      slug: cleanSlug,
      type,
      htmlContent: type === 'html_upload' ? htmlContent : '',
      proxyUrl: type === 'proxy_url' ? proxyUrl.trim() : '',
      fileSize,
      isActive: Boolean(isActive),
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedPages = [newPage, ...pages];
    saveLandingPages(updatedPages);
    const stats = getLandingPageStats();

    return NextResponse.json({ success: true, page: newPage, stats });
  } catch (error: any) {
    return NextResponse.json({ error: 'Lỗi máy chủ khi tạo Landing Page', details: error.message }, { status: 500 });
  }
}

// 3. PUT: Update an existing landing page
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, slug, type, htmlContent, proxyUrl, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID Landing Page' }, { status: 400 });
    }

    const pages = getLandingPages();
    const index = pages.findIndex((p) => p.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Không tìm thấy Landing Page cần sửa' }, { status: 404 });
    }

    const current = pages[index];
    const cleanSlug = slug ? sanitizeSlug(slug) : current.slug;

    // Check slug collision with other pages
    if (pages.some((p) => p.id !== id && p.slug === cleanSlug)) {
      return NextResponse.json({ error: `Đường dẫn "${cleanSlug}" đã được sử dụng bởi trang khác.` }, { status: 400 });
    }

    let fileSize = current.fileSize;
    let finalHtml = current.htmlContent;
    let finalProxy = current.proxyUrl;

    if (type === 'html_upload' && htmlContent !== undefined) {
      fileSize = Buffer.byteLength(htmlContent, 'utf8');
      if (fileSize > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: `Dung lượng file HTML (${(fileSize / 1024 / 1024).toFixed(2)} MB) vượt quá giới hạn 2 MB.`
          },
          { status: 400 }
        );
      }
      finalHtml = htmlContent;
      finalProxy = '';
    } else if (type === 'proxy_url' && proxyUrl !== undefined) {
      finalProxy = proxyUrl.trim();
      finalHtml = '';
      fileSize = 0;
    }

    const updatedPage: LandingPageItem = {
      ...current,
      title: title !== undefined ? title.trim() : current.title,
      slug: cleanSlug,
      type: type || current.type,
      htmlContent: finalHtml,
      proxyUrl: finalProxy,
      fileSize,
      isActive: isActive !== undefined ? Boolean(isActive) : current.isActive,
      updatedAt: new Date().toISOString()
    };

    pages[index] = updatedPage;
    saveLandingPages(pages);
    const stats = getLandingPageStats();

    return NextResponse.json({ success: true, page: updatedPage, stats });
  } catch (error: any) {
    return NextResponse.json({ error: 'Lỗi máy chủ khi cập nhật Landing Page', details: error.message }, { status: 500 });
  }
}

// 4. DELETE: Delete a landing page
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');

    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID Landing Page cần xóa' }, { status: 400 });
    }

    const pages = getLandingPages();
    const filtered = pages.filter((p) => p.id !== id);

    if (filtered.length === pages.length) {
      return NextResponse.json({ error: 'Không tìm thấy Landing Page cần xóa' }, { status: 404 });
    }

    saveLandingPages(filtered);
    const stats = getLandingPageStats();

    return NextResponse.json({ success: true, message: 'Đã xóa Landing Page thành công', stats });
  } catch (error: any) {
    return NextResponse.json({ error: 'Lỗi máy chủ khi xóa Landing Page', details: error.message }, { status: 500 });
  }
}
