import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import nodemailer from 'nodemailer';
import { getSiteContent, syncFileToGitHub } from '@/lib/storage';
import { verifyEditorSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const dataDir = path.join(process.cwd(), 'data');
const requestsFile = path.join(dataDir, 'customer-requests.json');
const tmpRequestsFile = path.join(os.tmpdir(), 'donghoa-customer-requests.json');

declare global {
  var __customerRequestsCache: any[] | undefined;
}

function getTargetEmail(): string {
  try {
    const siteContent = getSiteContent();
    if (siteContent?.settings?.email && siteContent.settings.email.includes('@')) {
      return siteContent.settings.email.trim();
    }
  } catch (err) {
    console.warn('Could not read dynamic target email from storage:', err);
  }
  return process.env.TARGET_EMAIL || 'Donghoadesign@gmail.com';
}

function getCustomerRequests(): any[] {
  if (globalThis.__customerRequestsCache) {
    return globalThis.__customerRequestsCache;
  }

  try {
    if (fs.existsSync(tmpRequestsFile)) {
      const raw = fs.readFileSync(tmpRequestsFile, 'utf8');
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        globalThis.__customerRequestsCache = list;
        return list;
      }
    }
  } catch (e) {}

  try {
    if (fs.existsSync(requestsFile)) {
      const raw = fs.readFileSync(requestsFile, 'utf8');
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        globalThis.__customerRequestsCache = list;
        return list;
      }
    }
  } catch (e) {}

  return [];
}

function saveRequestLocally(record: any) {
  try {
    const list = getCustomerRequests();
    list.unshift(record);
    globalThis.__customerRequestsCache = list;

    const jsonString = JSON.stringify(list, null, 2);

    try {
      fs.writeFileSync(tmpRequestsFile, jsonString, 'utf8');
    } catch (e) {}

    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(requestsFile, jsonString, 'utf8');
    } catch (e) {}

    // Cloud auto-sync to GitHub
    syncFileToGitHub('data/customer-requests.json', jsonString, `lead(contact): new request from ${record.fullName}`).catch(() => {});
  } catch (err) {
    console.error('Error saving customer request:', err);
  }
}

async function sendViaFormSubmit(
  data: {
    fullName: string;
    phone: string;
    propertyType?: string;
    area?: string;
    need?: string;
  },
  recipientEmail: string
) {
  try {
    const formattedTime = new Date().toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
    });

    const response = await fetch(`https://formsubmit.co/ajax/${recipientEmail}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Referer': 'https://donghoadesign.com',
        'Origin': 'https://donghoadesign.com',
      },
      body: JSON.stringify({
        _subject: `[Đông Hòa Design] Yêu Cầu Tư Vấn & Báo Giá: ${data.fullName} - ${data.phone}`,
        'Họ và tên khách hàng': data.fullName,
        'Số điện thoại': data.phone,
        'Loại hình bất động sản': data.propertyType || 'Chưa ghi',
        'Diện tích (m²)': data.area ? `${data.area} m²` : 'Chưa ghi',
        'Nhu cầu dịch vụ': data.need || 'Chưa ghi',
        'Thời gian gửi': formattedTime,
        _template: 'table',
        _captcha: 'false',
      }),
    });

    const resJson = await response.json().catch(() => ({}));
    return { success: true, resJson };
  } catch (err: any) {
    console.warn('FormSubmit dispatch warning:', err.message);
    return { success: false, error: err.message };
  }
}

async function sendViaSmtp(
  data: {
    fullName: string;
    phone: string;
    propertyType?: string;
    area?: string;
    need?: string;
  },
  recipientEmail: string
) {
  const user = process.env.GMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

  if (!user || !pass) {
    return { skipped: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2ddd3; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #04092b; color: #ffffff; padding: 24px; text-align: center;">
          <h2 style="margin: 0; font-size: 20px; letter-spacing: 1px; color: #c5a26c;">ĐÔNG HÒA DESIGN</h2>
          <p style="margin: 6px 0 0; font-size: 14px; color: #e2ddd3;">THÔNG BÁO YÊU CẦU TƯ VẤN & BÁO GIÁ MỚI</p>
        </div>
        <div style="padding: 24px; background-color: #faf8f5;">
          <p style="font-size: 14px; color: #333; line-height: 1.6;">Xin chào, website vừa ghi nhận một yêu cầu tư vấn mới từ khách hàng:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px; background-color: #ffffff; border-radius: 6px; overflow: hidden;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 12px 16px; font-weight: bold; color: #04092b; width: 35%;">Họ và tên:</td>
              <td style="padding: 12px 16px; color: #333;">${data.fullName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 12px 16px; font-weight: bold; color: #04092b;">Số điện thoại:</td>
              <td style="padding: 12px 16px; color: #a70c0c; font-weight: bold;"><a href="tel:${data.phone}" style="color: #a70c0c; text-decoration: none;">${data.phone}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 12px 16px; font-weight: bold; color: #04092b;">Loại hình nhà:</td>
              <td style="padding: 12px 16px; color: #333;">${data.propertyType || 'Chưa ghi'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 12px 16px; font-weight: bold; color: #04092b;">Diện tích (m²):</td>
              <td style="padding: 12px 16px; color: #333;">${data.area ? `${data.area} m²` : 'Chưa ghi'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 12px 16px; font-weight: bold; color: #04092b;">Nhu cầu:</td>
              <td style="padding: 12px 16px; color: #333;">${data.need || 'Chưa ghi'}</td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; font-weight: bold; color: #04092b;">Thời gian nhận:</td>
              <td style="padding: 12px 16px; color: #666; font-size: 13px;">${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</td>
            </tr>
          </table>
          <div style="margin-top: 24px; text-align: center;">
            <a href="tel:${data.phone}" style="display: inline-block; background-color: #04092b; color: #ffffff; padding: 12px 28px; border-radius: 4px; text-decoration: none; font-weight: bold; font-size: 13px; letter-spacing: 0.5px;">GỌI NGAY CHO KHÁCH HÀNG</a>
          </div>
        </div>
        <div style="background-color: #f0ebe1; padding: 14px; text-align: center; font-size: 12px; color: #777;">
          Email tự động gửi từ hệ thống Đông Hòa Design (gửi tới ${recipientEmail})
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Đông Hòa Design" <${user}>`,
      to: recipientEmail,
      subject: `[Đông Hòa Design] Yêu Cầu Tư Vấn Mới - ${data.fullName} (${data.phone})`,
      html: htmlContent,
    });

    return { success: true };
  } catch (err: any) {
    console.error('SMTP send error:', err);
    return { success: false, error: err.message };
  }
}

export async function GET(request: NextRequest) {
  const isAuth = verifyEditorSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Chỉ Quản trị viên mới có quyền xem danh sách yêu cầu tư vấn.' }, { status: 403 });
  }

  const requests = getCustomerRequests();
  return NextResponse.json({
    success: true,
    total: requests.length,
    requests
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, phone, propertyType, area, need, website_hp } = body;

    // Honeypot spam check
    if (website_hp) {
      return NextResponse.json({ success: true, message: 'Yêu cầu tư vấn đã được ghi nhận.' });
    }

    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ error: 'Vui lòng nhập họ và tên của bạn.' }, { status: 400 });
    }

    if (!phone || !phone.trim() || phone.trim().length < 8) {
      return NextResponse.json({ error: 'Vui lòng nhập số điện thoại hợp lệ (tối thiểu 8-11 số).' }, { status: 400 });
    }

    const targetEmail = getTargetEmail();

    const newRecord = {
      id: `req-${Date.now()}`,
      fullName: fullName.trim(),
      phone: phone.trim(),
      propertyType: propertyType?.trim() || '',
      area: area?.trim() || '',
      need: need?.trim() || '',
      targetEmail: targetEmail,
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    // 1. Always persist locally and cloud-sync to GitHub
    saveRequestLocally(newRecord);

    // 2. Dispatch via FormSubmit directly to configured email
    sendViaFormSubmit(
      {
        fullName: newRecord.fullName,
        phone: newRecord.phone,
        propertyType: newRecord.propertyType,
        area: newRecord.area,
        need: newRecord.need,
      },
      targetEmail
    ).catch(() => {});

    // 3. Dispatch via SMTP if credentials are configured
    sendViaSmtp(
      {
        fullName: newRecord.fullName,
        phone: newRecord.phone,
        propertyType: newRecord.propertyType,
        area: newRecord.area,
        need: newRecord.need,
      },
      targetEmail
    ).catch(() => {});

    return NextResponse.json({
      success: true,
      message: `Yêu cầu tư vấn đã được gửi thành công đến ${targetEmail}`,
      data: newRecord,
    });
  } catch (err: any) {
    console.error('API /api/contact error:', err);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}
