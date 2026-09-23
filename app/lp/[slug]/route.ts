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

  // If page exists in database and is explicitly turned OFF
  if (landingPage && landingPage.isActive === false) {
    return notFoundResponse();
  }

  // If landing page has offline HTML uploaded, serve it directly
  if (landingPage && landingPage.type === 'html_upload' && landingPage.htmlContent) {
    // Increment view count asynchronously
    try {
      const allPages = getLandingPages();
      const idx = allPages.findIndex((p) => p.id === landingPage.id);
      if (idx !== -1) {
        allPages[idx] = {
          ...allPages[idx],
          viewCount: (allPages[idx].viewCount || 0) + 1
        };
        saveLandingPages(allPages);
      }
    } catch (e) {}

    return new NextResponse(landingPage.htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=60, s-maxage=300',
        'X-Powered-By': 'DongHoa-LandingEngine'
      }
    });
  }

  // Otherwise, automatically fetch & stream from LadiPage Subdomain (lp.donghoadesign.com)
  const targetUrl = `https://lp.donghoadesign.com/${slug}`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    if (response.ok) {
      const html = await response.text();
      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=60, s-maxage=300',
          'X-Powered-By': 'DongHoa-LadiProxy'
        }
      });
    }
  } catch (err) {
    // Domain or network not ready yet
  }

  // If not reachable or waiting for DNS activation
  return waitingLadiPageResponse(slug, landingPage?.title);
}

function waitingLadiPageResponse(slug: string, title?: string) {
  const displayTitle = title || `Chiến Dịch /lp/${slug}`;
  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${displayTitle} - Đông Hòa Design</title>
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
    .box { background: rgba(0,0,0,0.3); border: 1px dashed rgba(197, 162, 108, 0.4); border-radius: 12px; padding: 16px; font-family: monospace; font-size: 13px; color: #38bdf8; word-break: break-all; margin-bottom: 24px; }
    .btn { display: inline-block; background: #c5a26c; color: #04092b; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; padding: 12px 28px; border-radius: 12px; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🚀</div>
    <h1>Trang Đang Kết Nối Với LadiPage</h1>
    <p>Đường dẫn <strong>/lp/${slug}</strong> đã sẵn sàng. Khi bạn xuất bản trang trên LadiPage với tên miền <code>lp.donghoadesign.com/${slug}</code>, nội dung sẽ hiển thị tại đây.</p>
    <div class="box">https://lp.donghoadesign.com/${slug}</div>
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
