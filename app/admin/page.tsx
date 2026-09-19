'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FileText,
  Image as ImageIcon,
  ArrowRight,
  Eye,
  Plus,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Palette
} from 'lucide-react';
import { BlogPost, MediaItem } from '@/lib/types';

export default function AdminDashboardPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);

  useEffect(() => {
    fetch('/api/posts').then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setPosts(data);
    });
    fetch('/api/media').then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setMedia(data);
    });
  }, []);

  const publishedPosts = posts.filter((p) => p.status === 'published').length;
  const draftPosts = posts.filter((p) => p.status === 'draft').length;

  return (
    <div className="p-3.5 sm:p-6 lg:p-10 space-y-5 sm:space-y-8 max-w-[1280px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#e2ddd3] bg-white p-4 sm:p-6 shadow-sm rounded-2xl sm:rounded-3xl">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-[#a70c0c] uppercase tracking-widest font-accent">
            BẢNG ĐIỀU KHIỂN QUẢN TRỊ BLOG
          </span>
          <h1 className="text-[22px] sm:text-[30px] font-semibold text-[#04092b] font-display">
            Đông Hòa Design CMS
          </h1>
          <p className="text-[12.5px] sm:text-[13px] text-[#6e706a]">
            Hệ thống quản lý bài viết, chuyên mục, hình ảnh và nội dung website cực kỳ đơn giản cho biên tập viên.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center sm:gap-3 shrink-0">
          <Link
            href="/admin/blog"
            className="bg-[#04092b] hover:bg-[#c5a26c] text-white hover:text-[#04092b] px-3.5 sm:px-5 py-2.5 text-[12px] sm:text-[13px] font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow rounded-xl"
          >
            <Plus className="w-4 h-4 shrink-0" /> <span className="truncate">Viết bài mới</span>
          </Link>
          <Link
            href="/blog"
            target="_blank"
            className="border border-[#04092b] hover:bg-[#04092b] text-[#04092b] hover:text-white px-3.5 sm:px-4 py-2.5 text-[12px] sm:text-[13px] font-semibold transition-colors flex items-center justify-center gap-1.5 rounded-xl"
          >
            <Eye className="w-4 h-4 shrink-0" /> <span className="truncate">Xem Blog Live</span>
          </Link>
        </div>
      </div>

      {/* 4 Quick Action & Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
        <Link
          href="/admin/pages"
          className="bg-white p-4 sm:p-6 border-2 border-[#c5a26c] shadow-sm hover:shadow-lg transition-all group block rounded-2xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-[#04092b] uppercase">Giao diện Trang chủ</span>
            <Palette className="w-5 h-5 text-[#c5a26c]" />
          </div>
          <p className="text-[20px] font-bold text-[#04092b] font-display mt-2">Toàn bộ 10 Frame</p>
          <p className="text-[12px] text-[#c5a26c] font-semibold flex items-center gap-1 mt-1 group-hover:underline">
            Tùy chỉnh ảnh & chữ trực tiếp →
          </p>
        </Link>

        <Link
          href="/admin/blog"
          className="bg-white p-4 sm:p-6 border border-[#e2ddd3] hover:border-[#c5a26c] shadow-sm transition-all group block rounded-2xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-[#6e706a] uppercase">Bài viết đã xuất bản</span>
            <FileText className="w-5 h-5 text-[#c5a26c]" />
          </div>
          <p className="text-[28px] sm:text-[32px] font-bold text-[#04092b] font-display mt-1">{publishedPosts}</p>
          <p className="text-[12px] text-[#c5a26c] font-medium flex items-center gap-1 mt-1 group-hover:underline">
            Quản lý và biên tập bài viết →
          </p>
        </Link>

        <Link
          href="/admin/blog"
          className="bg-white p-4 sm:p-6 border border-[#e2ddd3] hover:border-[#c5a26c] shadow-sm transition-all group block rounded-2xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-[#6e706a] uppercase">Bản nháp đang soạn</span>
            <BookOpen className="w-5 h-5 text-[#c5a26c]" />
          </div>
          <p className="text-[28px] sm:text-[32px] font-bold text-[#04092b] font-display mt-1">{draftPosts}</p>
          <p className="text-[12px] text-[#c5a26c] font-medium flex items-center gap-1 mt-1 group-hover:underline">
            Xem bài viết bản nháp →
          </p>
        </Link>

        <Link
          href="/admin/media"
          className="bg-white p-4 sm:p-6 border border-[#e2ddd3] hover:border-[#c5a26c] shadow-sm transition-all group block rounded-2xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-[#6e706a] uppercase">Thư viện ảnh gốc</span>
            <ImageIcon className="w-5 h-5 text-[#c5a26c]" />
          </div>
          <p className="text-[28px] sm:text-[32px] font-bold text-[#04092b] font-display mt-1">16+ Ảnh</p>
          <p className="text-[12px] text-[#c5a26c] font-medium flex items-center gap-1 mt-1 group-hover:underline">
            Tải lên & quản lý thư viện ảnh →
          </p>
        </Link>
      </div>

      {/* Guide for Non-Technical Editors */}
      <div className="bg-white border border-[#e2ddd3] p-4 sm:p-8 shadow-sm space-y-4 rounded-2xl">
        <h3 className="font-semibold text-[18px] text-[#04092b] font-display flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#c5a26c]" /> Hướng Dẫn Biên Tập Cho Người Mới
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13.5px] text-[#1a1b18]">
          <div className="p-4 bg-[#f4f1ea] border border-[#e2ddd3] space-y-2">
            <h4 className="font-bold text-[#04092b] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-600" /> Cách đăng bài viết mới:
            </h4>
            <p className="text-[#6e706a] leading-relaxed">
              Vào mục <strong>Quản lý Bài viết</strong> → Nhấn <strong>Viết bài mới</strong>. Nhập tiêu đề, chọn chuyên mục, gõ tóm tắt và dùng thanh công cụ soạn thảo để thêm đề mục H2, H3 hoặc danh sách.
            </p>
          </div>

          <div className="p-4 bg-[#f4f1ea] border border-[#e2ddd3] space-y-2">
            <h4 className="font-bold text-[#04092b] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-600" /> Cách chọn ảnh và xem trước:
            </h4>
            <p className="text-[#6e706a] leading-relaxed">
              Trong cửa sổ soạn thảo, nhấn <strong>Chọn từ thư viện Figma</strong> để chọn ngay ảnh đẹp mà không cần tải lên từ máy tính, sau đó chuyển qua tab <strong>Xem trước</strong> để kiểm tra bài viết.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
