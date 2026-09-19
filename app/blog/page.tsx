import React, { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getSiteContent, getBlogPosts } from '@/lib/storage';
import BlogListingClient from './BlogListingClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Tin Tức & Góc Nhìn Chuyên Gia | Đông Hòa Design',
  description: 'Chia sẻ cẩm nang thiết kế nội thất cao cấp, xu hướng không gian sống độc bản và kinh nghiệm thi công trọn gói từ KTS Đông Hòa Design.',
};

export default function BlogListingPage() {
  const content = getSiteContent();
  const posts = getBlogPosts().filter(p => p.status === 'published');

  return (
    <>
      <Navbar settings={content.settings} />
      <main className="min-h-screen bg-[#f4f1ea] pt-28 sm:pt-32 pb-24 px-4 sm:px-8 lg:px-20">
        <Suspense fallback={<div className="text-center py-20 text-[#6e706a]">Đang tải danh sách bài viết...</div>}>
          <BlogListingClient initialPosts={posts} />
        </Suspense>
      </main>
      <Footer settings={content.settings} />
    </>
  );
}
