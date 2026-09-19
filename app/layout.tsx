import type { Metadata, Viewport } from 'next';
import { Montserrat, Manrope, Alex_Brush } from 'next/font/google';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-montserrat',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope',
  display: 'swap',
});

const alexBrush = Alex_Brush({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-script',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#04092b',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://donghoa-design-six.vercel.app'),
  title: 'Đông Hòa Design | Thiết Kế & Thi Công Nội Thất Cao Cấp Trọn Gói',
  description: 'Thương hiệu thiết kế & thi công nội thất cao cấp trọn gói hàng đầu. Cá nhân hóa 100% không gian sống mang đậm dấu ấn bản sắc riêng.',
  keywords: ['Đông Hòa Design', 'Thiết kế nội thất', 'Thi công nội thất trọn gói', 'Nội thất cao cấp', 'Biệt thự sang trọng'],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Đông Hòa Design | Thiết Kế & Thi Công Nội Thất Cao Cấp Trọn Gói',
    description: 'Thương hiệu thiết kế & thi công nội thất cao cấp trọn gói hàng đầu. Cá nhân hóa 100% không gian sống mang đậm dấu ấn bản sắc riêng.',
    url: 'https://donghoa-design-six.vercel.app',
    siteName: 'Đông Hòa Design',
    images: [
      {
        url: '/uploads/hero_slide_1.png',
        width: 1200,
        height: 630,
        alt: 'Đông Hòa Design',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
};

import FloatingContact from '@/components/FloatingContact';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${montserrat.variable} ${manrope.variable} ${alexBrush.variable} scroll-smooth overflow-x-hidden`}>
      <body className="font-sans antialiased bg-[#f4f1ea] text-[#2d302e] min-h-screen flex flex-col selection:bg-[#c5a26c] selection:text-white overflow-x-hidden w-full relative">
        {children}
        <FloatingContact />
      </body>
    </html>
  );
}
