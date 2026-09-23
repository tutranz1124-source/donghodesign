import { NextRequest, NextResponse } from 'next/server';
import { getLandingPages, saveLandingPages, getLandingPageBySlug } from '@/lib/storage';
import { LandingPageItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

// 1. GET: Test webhook endpoint connection
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({
      status: 'ready',
      message: 'DongHoa Landing Webhook Endpoint is ready. Please provide ?slug=your-slug to target a specific landing page.'
    });
  }

  const page = getLandingPageBySlug(slug);
  if (!page) {
    return NextResponse.json({
      status: 'waiting',
      message: `Landing page with slug "${slug}" is registered and waiting for initial HTML sync.`
    });
  }

  return NextResponse.json({
    status: 'active',
    slug: page.slug,
    title: page.title,
    type: page.type,
    updatedAt: page.updatedAt
  });
}

// 2. POST: Receive HTML / Sync payload from LadiPage or External Webhook
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slugQuery = searchParams.get('slug');

    let body: any = {};
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      body = await req.json().catch(() => ({}));
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await req.formData().catch(() => null);
      if (formData) {
        formData.forEach((value, key) => {
          body[key] = value;
        });
      }
    } else {
      // Plain text or raw HTML
      const rawText = await req.text();
      try {
        body = JSON.parse(rawText);
      } catch (e) {
        body = { html: rawText };
      }
    }

    const targetSlug = (slugQuery || body.slug || body.page_slug || '').trim().toLowerCase();

    if (!targetSlug) {
      return NextResponse.json(
        { error: 'Thiếu tham số slug. Vui lòng gửi URL kèm ?slug=ten-trang' },
        { status: 400 }
      );
    }

    // Extract HTML or URL payload
    const receivedHtml = body.html_code || body.html || body.content || body.htmlContent || (typeof body === 'string' ? body : '');
    const receivedUrl = body.url || body.proxy_url || body.ladipage_url || body.publish_url || '';
    const title = body.title || body.page_name || `Landing Page: ${targetSlug}`;

    const pages = getLandingPages();
    const existingIndex = pages.findIndex((p) => p.slug.toLowerCase() === targetSlug);

    let updatedPage: LandingPageItem;

    if (existingIndex !== -1) {
      // Update existing landing page
      const current = pages[existingIndex];
      const finalHtml = receivedHtml ? String(receivedHtml) : current.htmlContent;
      const finalProxy = receivedUrl ? String(receivedUrl).trim() : current.proxyUrl;
      const fileSize = finalHtml ? Buffer.byteLength(finalHtml, 'utf8') : 0;

      updatedPage = {
        ...current,
        title: body.title ? String(body.title).trim() : current.title,
        type: finalHtml ? 'html_upload' : 'proxy_url',
        htmlContent: finalHtml,
        proxyUrl: finalProxy,
        fileSize,
        isActive: true,
        updatedAt: new Date().toISOString()
      };
      pages[existingIndex] = updatedPage;
    } else {
      // Create new landing page on-the-fly
      const finalHtml = receivedHtml ? String(receivedHtml) : '';
      const finalProxy = receivedUrl ? String(receivedUrl).trim() : '';
      const fileSize = finalHtml ? Buffer.byteLength(finalHtml, 'utf8') : 0;

      updatedPage = {
        id: `lp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: String(title).trim(),
        slug: targetSlug,
        type: finalHtml ? 'html_upload' : 'proxy_url',
        htmlContent: finalHtml,
        proxyUrl: finalProxy,
        fileSize,
        isActive: true,
        viewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      pages.unshift(updatedPage);
    }

    saveLandingPages(pages);

    return NextResponse.json({
      success: true,
      message: `Đã đồng bộ thành công Landing Page "${targetSlug}"`,
      publicUrl: `https://donghoadesign.com/lp/${targetSlug}`,
      page: updatedPage
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Lỗi máy chủ khi xử lý Webhook đồng bộ LadiPage', details: error.message },
      { status: 500 }
    );
  }
}
