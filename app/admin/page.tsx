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
  Palette,
  Layers,
  PhoneCall,
  ShieldCheck,
  Zap,
  Clock,
  Compass,
  Briefcase,
  Building,
  Upload,
  ExternalLink
} from 'lucide-react';
import { BlogPost, MediaItem, SiteContentData } from '@/lib/types';

export default function AdminDashboardPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [content, setContent] = useState<SiteContentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/posts').then((r) => r.json()),
      fetch('/api/media').then((r) => r.json()),
      fetch('/api/content').then((r) => r.json())
    ])
      .then(([postsData, mediaData, contentData]) => {
        if (Array.isArray(postsData)) setPosts(postsData);
        if (Array.isArray(mediaData)) setMedia(mediaData);
        if (contentData) setContent(contentData);
      })
      .finally(() => setLoading(false));
  }, []);

  const publishedPosts = posts.filter((p) => p.status === 'published').length;
  const draftPosts = posts.filter((p) => p.status === 'draft').length;

  const sectionsStatus = [
    { name: '1. Hero Slideshow', tab: 'hero', icon: Sparkles, desc: 'Banner trượt đầu trang & Tagline' },
    { name: '2. Canva Studio (4 Phong Cách)', tab: 'canva', icon: Layers, desc: 'Modern, Cozy, Luxury, Heritage' },
    { name: '3. Triết Lý Thiết Kế', tab: 'philosophy', icon: Compass, desc: '3 Trụ cột cốt lõi thương hiệu' },
    { name: '4. Tư Vấn & Báo Giá', tab: 'contact', icon: PhoneCall, desc: 'Trích dẫn phong cách & Hotline' },
    { name: '5. Tổng Quan Phong Cách', tab: 'styles', icon: Palette, desc: 'Danh sách 4 thẻ phong cách' },
    { name: '6. Nội Thất Văn Phòng', tab: 'office', icon: Briefcase, desc: 'Không gian giám đốc & Bảng màu' },
    { name: '7. Thương Hiệu & Footer', tab: 'settings', icon: Building, desc: 'Logo, Hotline, Địa chỉ & Chân trang' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 max-w-[1440px] mx-auto pb-10">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#04092b] via-[#0b1340] to-[#04092b] text-white p-6 sm:p-8 lg:p-10 rounded-3xl border border-[#c5a26c]/30 shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a26c]/20 border border-[#c5a26c]/40 text-[#c5a26c] text-[11.5px] font-bold uppercase tracking-wider font-accent">
              <Sparkles className="w-3.5 h-3.5" /> Hệ Thống Quản Trị Trung Tâm Đông Hòa Design
            </div>
            <h1 className="text-[24px] sm:text-[32px] lg:text-[36px] font-bold text-white font-display leading-tight">
              Bảng Điều Khiển &amp; Quản Lý Toàn Diện
            </h1>
            <p className="text-[13px] sm:text-[14px] text-white/80 leading-relaxed font-light">
              Tùy biến nội dung trực tiếp trên 10 Frame Trang chủ, quản lý thư viện hình ảnh, biên tập bài viết blog và cấu hình thông tin thương hiệu với tốc độ phản hồi tức thì.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/admin/pages"
              className="px-5 py-3 bg-[#c5a26c] hover:bg-[#b5915a] text-[#04092b] font-bold text-[13.5px] rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              <span>Chỉnh Sửa Trang Chủ</span>
            </Link>
            <Link
              href="/admin/blog"
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-[13.5px] rounded-xl transition-all border border-white/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Viết Bài Mới</span>
            </Link>
          </div>
        </div>

        {/* Decorative Watermark */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-5 pointer-events-none">
          <Layers className="w-96 h-96 text-white" />
        </div>
      </div>

      {/* 4 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Link
          href="/admin/pages"
          className="bg-white p-5 sm:p-6 rounded-2xl border border-[#e2ddd3] hover:border-[#c5a26c] shadow-xs hover:shadow-md transition-all group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-[#6e706a] uppercase">Giao diện Trang chủ</span>
            <div className="w-10 h-10 rounded-xl bg-[#faf8f5] border border-[#e2ddd3] flex items-center justify-center text-[#c5a26c]">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[26px] font-bold text-[#04092b] font-display mt-2">10 Khối Frame</p>
          <p className="text-[12px] text-[#c5a26c] font-bold flex items-center gap-1 mt-1 group-hover:underline">
            Tùy chỉnh ảnh & chữ trực tiếp →
          </p>
        </Link>

        <Link
          href="/admin/blog"
          className="bg-white p-5 sm:p-6 rounded-2xl border border-[#e2ddd3] hover:border-[#c5a26c] shadow-xs hover:shadow-md transition-all group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-[#6e706a] uppercase">Bài viết xuất bản</span>
            <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center text-green-600">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[26px] font-bold text-[#04092b] font-display mt-2">{publishedPosts} Bài Viết</p>
          <p className="text-[12px] text-[#c5a26c] font-bold flex items-center gap-1 mt-1 group-hover:underline">
            Quản lý và biên tập nội dung →
          </p>
        </Link>

        <Link
          href="/admin/blog"
          className="bg-white p-5 sm:p-6 rounded-2xl border border-[#e2ddd3] hover:border-[#c5a26c] shadow-xs hover:shadow-md transition-all group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-[#6e706a] uppercase">Bản nháp đang soạn</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[26px] font-bold text-[#04092b] font-display mt-2">{draftPosts} Bản Nháp</p>
          <p className="text-[12px] text-[#c5a26c] font-bold flex items-center gap-1 mt-1 group-hover:underline">
            Tiếp tục soạn bài viết →
          </p>
        </Link>

        <Link
          href="/admin/media"
          className="bg-white p-5 sm:p-6 rounded-2xl border border-[#e2ddd3] hover:border-[#c5a26c] shadow-xs hover:shadow-md transition-all group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-[#6e706a] uppercase">Thư viện hình ảnh</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <ImageIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[26px] font-bold text-[#04092b] font-display mt-2">{media.length} Tài Nguyên</p>
          <p className="text-[12px] text-[#c5a26c] font-bold flex items-center gap-1 mt-1 group-hover:underline">
            Tải lên & quản lý thư viện ảnh →
          </p>
        </Link>
      </div>

      {/* 2-Column Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 10 Homepage Section Jump Board */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-[#e2ddd3] shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#e2ddd3] pb-4">
            <div>
              <h3 className="font-bold text-[18px] text-[#04092b] flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#c5a26c]" /> Bảng Điều Hướng Chỉnh Sửa 10 Frame Trang Chủ
              </h3>
              <p className="text-[12.5px] text-[#6e706a] mt-0.5">
                Bấm vào từng khối để mở nhanh tab chỉnh sửa tương ứng trong Page Editor.
              </p>
            </div>
            <Link
              href="/admin/pages"
              className="text-[12.5px] font-bold text-[#c5a26c] hover:underline flex items-center gap-1 shrink-0"
            >
              Mở Trình Soạn Thảo →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {sectionsStatus.map((sec, idx) => {
              const Icon = sec.icon;
              return (
                <Link
                  key={idx}
                  href={`/admin/pages?tab=${sec.tab}`}
                  className="p-4 rounded-2xl border border-[#e2ddd3] hover:border-[#c5a26c] bg-[#faf8f5] hover:bg-white transition-all group flex items-start justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white border border-[#e2ddd3] flex items-center justify-center text-[#04092b] group-hover:text-[#c5a26c] group-hover:border-[#c5a26c] shrink-0 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-[13.5px] text-[#04092b] group-hover:text-[#c5a26c] transition-colors truncate">
                        {sec.name}
                      </h4>
                      <p className="text-[11.5px] text-[#6e706a] truncate mt-0.5">{sec.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#c5a26c] group-hover:translate-x-0.5 transition-all shrink-0 mt-2" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Column: System Status & Quick Guide */}
        <div className="lg:col-span-4 space-y-6">
          {/* Real-time System Status Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#e2ddd3] shadow-xs space-y-4">
            <h3 className="font-bold text-[16px] text-[#04092b] flex items-center gap-2 border-b border-[#e2ddd3] pb-3">
              <Zap className="w-4 h-4 text-[#c5a26c]" /> Trạng Thái Hệ Thống
            </h3>

            <div className="space-y-3 text-[13px]">
              <div className="flex items-center justify-between p-2.5 bg-[#faf8f5] rounded-xl border border-[#e2ddd3]">
                <span className="text-[#6e706a] font-medium">Đồng bộ đa tab (Broadcast)</span>
                <span className="font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Hoạt động
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-[#faf8f5] rounded-xl border border-[#e2ddd3]">
                <span className="text-[#6e706a] font-medium">Bộ nhớ lưu trữ cục bộ</span>
                <span className="font-bold text-[#04092b] font-mono text-[12px]">JSON Storage (/data)</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-[#faf8f5] rounded-xl border border-[#e2ddd3]">
                <span className="text-[#6e706a] font-medium">Next.js Revalidation</span>
                <span className="font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded text-[11px]">
                  Tức thì (On-Demand)
                </span>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts for Editor */}
          <div className="bg-white p-6 rounded-3xl border border-[#e2ddd3] shadow-xs space-y-4">
            <h3 className="font-bold text-[16px] text-[#04092b] flex items-center gap-2 border-b border-[#e2ddd3] pb-3">
              <Sparkles className="w-4 h-4 text-[#c5a26c]" /> Phím Tắt Tiện Ích
            </h3>

            <div className="space-y-2.5 text-[12.5px] text-[#6e706a]">
              <div className="flex items-center justify-between">
                <span>Lưu thay đổi trong Editor</span>
                <kbd className="px-2 py-1 bg-[#faf8f5] border border-[#e2ddd3] rounded font-mono font-bold text-[11px] text-[#04092b]">
                  Ctrl + S
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Chuyển đổi Desktop / Mobile</span>
                <kbd className="px-2 py-1 bg-[#faf8f5] border border-[#e2ddd3] rounded font-mono font-bold text-[11px] text-[#04092b]">
                  Device Toggle
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Crop ảnh trong Canva Studio</span>
                <kbd className="px-2 py-1 bg-[#faf8f5] border border-[#e2ddd3] rounded font-mono font-bold text-[11px] text-[#04092b]">
                  Crop Button
                </kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
