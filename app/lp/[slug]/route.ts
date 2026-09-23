import { NextRequest, NextResponse } from 'next/server';
import { getLandingPageBySlug, getLandingPages, saveLandingPages } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  if (!slug) {
    return notFoundResponse();
  }

  const landingPage = getLandingPageBySlug(slug);

  // If landing page doesn't exist or is currently inactive/disabled
  if (!landingPage || !landingPage.isActive) {
    return notFoundResponse();
  }

  // Optional: Increment view count asynchronously
  try {
    const allPages = getLandingPages();
    const idx = allPages.findIndex((p) => p.id === landingPage.id);
    if (idx !== -1) {
      allPages[idx] = {
        ...allPages[idx],
        viewCount: (allPages[idx].viewCount || 0) + 1
      };
      // Save in background without blocking response
      saveLandingPages(allPages);
    }
  } catch (e) {}

  // 1. Serving Uploaded HTML Content
  if (landingPage.type === 'html_upload' && landingPage.htmlContent) {
    return new NextResponse(landingPage.htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=60, s-maxage=300',
        'X-Powered-By': 'DongHoa-LandingEngine'
      }
    });
  }

  // 2. Serving Proxy LadiPage URL (0 KB storage)
  if (landingPage.type === 'proxy_url' && landingPage.proxyUrl) {
    try {
      const response = await fetch(landingPage.proxyUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });

      if (!response.ok) {
        return new NextResponse(
          generateErrorHtml(
            'Không thể kết nối đến máy chủ LadiPage',
            `Máy chủ LadiPage trả về mã lỗi: ${response.status}. Vui lòng kiểm tra lại đường link proxy trong trang Admin.`
          ),
          { status: 502, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      }

      const proxyHtml = await response.text();

      return new NextResponse(proxyHtml, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=60, s-maxage=300',
          'X-Powered-By': 'DongHoa-LadiProxy'
        }
      });
    } catch (err: any) {
      return new NextResponse(
        generateErrorHtml(
          'Lỗi kết nối Landing Page',
          `Không thể tải nội dung từ đường link: ${landingPage.proxyUrl}. Chi tiết: ${err.message}`
        ),
        { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }
  }

  // 3. Landing page created with Webhook & waiting for initial sync
  return waitingWebhookResponse(landingPage.slug, landingPage.title);
}

function waitingWebhookResponse(slug: string, title: string) {
  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Đang Chờ Đồng Bộ LadiPage</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #04092b;
      color: #ffffff;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      text-align: center;
    }
    .card {
      max-width: 600px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(197, 162, 108, 0.4);
      border-radius: 24px;
      padding: 48px 32px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { font-size: 22px; color: #c5a26c; margin-bottom: 12px; }
    p { font-size: 14px; color: #cbd5e1; line-height: 1.6; margin-bottom: 24px; }
    .box { background: rgba(0,0,0,0.3); border: 1px dashed rgba(197, 162, 108, 0.4); border-radius: 12px; padding: 16px; font-family: monospace; font-size: 12.5px; color: #38bdf8; word-break: break-all; margin-bottom: 24px; }
    .btn { display: inline-block; background: #c5a26c; color: #04092b; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; padding: 12px 28px; border-radius: 12px; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">⚡</div>
    <h1>Webhook Đã Kết Nối & Sẵn Sàng</h1>
    <p>Trang <strong>${title}</strong> (<code>/lp/${slug}</code>) đã được khởi tạo thành công trên hệ thống Đông Hòa Design. Vui lòng dán Webhook URL bên dưới vào LadiPage và bấm <strong>"Xuất bản"</strong>:</p>
    <div class="box">https://donghoadesign.com/api/landing/webhook?slug=${slug}</div>
    <a href="https://donghoadesign.com" class="btn">Về Trang Chủ Đông Hòa</a>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

function notFoundResponse() {
  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Trang Không Tồn Tại - Đông Hòa Design</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #04092b;
      color: #ffffff;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      text-align: center;
    }
    .card {
      max-width: 540px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(197, 162, 108, 0.3);
      border-radius: 24px;
      padding: 48px 32px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .code {
      font-size: 56px;
      font-weight: 800;
      color: #c5a26c;
      margin-bottom: 12px;
      letter-spacing: -1px;
    }
    h1 {
      font-size: 22px;
      margin-bottom: 12px;
      color: #ffffff;
    }
    p {
      font-size: 14px;
      color: #94a3b8;
      line-height: 1.6;
      margin-bottom: 28px;
    }
    .btn {
      display: inline-block;
      background: #c5a26c;
      color: #04092b;
      font-weight: 700;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 12px 28px;
      border-radius: 12px;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn:hover {
      background: #dfb87d;
      transform: translateY(-2px);
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="code">404</div>
    <h1>Trang Landing Page Chưa Khởi Tạo</h1>
    <p>Trang này hiện không khả dụng, đã tạm ngưng hoặc chưa được cấu hình trên hệ thống Đông Hòa Design.</p>
    <a href="https://donghoadesign.com" class="btn">Trở Về Trang Chủ</a>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status: 404,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

function generateErrorHtml(title: string, message: string) {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Đông Hòa Design</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #04092b;
      color: #fff;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .box {
      max-width: 580px;
      background: rgba(255,255,255,0.05);
      border: 1px solid #ef4444;
      border-radius: 20px;
      padding: 40px 28px;
      text-align: center;
    }
    h2 { color: #f87171; margin-bottom: 12px; font-size: 20px; }
    p { color: #cbd5e1; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
    a { color: #c5a26c; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="box">
    <h2>⚠️ ${title}</h2>
    <p>${message}</p>
    <a href="https://donghoadesign.com">Quay lại Trang Chủ Đông Hòa Design</a>
  </div>
</body>
</html>`;
}

