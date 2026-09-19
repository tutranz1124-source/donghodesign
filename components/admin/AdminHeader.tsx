'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Eye,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  Edit3,
  Sparkles,
  Layers,
  FileText,
  ImageIcon,
  Users,
  LayoutDashboard
} from 'lucide-react';
import { AuthSessionUser } from '@/lib/types';

interface AdminHeaderProps {
  user: AuthSessionUser | null;
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const pathname = usePathname();

  const getPageMeta = () => {
    switch (pathname) {
      case '/admin':
        return { title: 'Tổng Quan Bảng Điều Khiển', icon: LayoutDashboard, category: 'Dashboard' };
      case '/admin/pages':
        return { title: 'Giao Diện & Canvas Trang Chủ', icon: Layers, category: 'Page Builder' };
      case '/admin/blog':
        return { title: 'Quản Lý Bài Viết & Tin Tức', icon: FileText, category: 'Blog CMS' };
      case '/admin/media':
        return { title: 'Thư Viện Hình Ảnh & Asset', icon: ImageIcon, category: 'Media Library' };
      case '/admin/users':
        return { title: 'Tài Khoản & Phân Quyền', icon: Users, category: 'System' };
      default:
        return { title: 'Quản Trị CMS', icon: Sparkles, category: 'Admin' };
    }
  };

  const meta = getPageMeta();
  const Icon = meta.icon;
  const isAdmin = user?.role === 'admin';

  return (
    <header className="hidden md:flex items-center justify-between px-6 lg:px-10 py-3.5 bg-white border-b border-[#e2ddd3] sticky top-0 z-30 shadow-xs">
      {/* Breadcrumb / Page Title */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[#faf8f5] border border-[#e2ddd3] flex items-center justify-center text-[#c5a26c]">
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-1.5 text-[13px]">
          <span className="text-[#6e706a] font-medium">{meta.category}</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-bold text-[#04092b]">{meta.title}</span>
        </div>
      </div>

      {/* Right Utility Bar */}
      <div className="flex items-center gap-3">
        {/* Live Sync Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-[11px] font-bold">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>Live Sync Active</span>
        </div>

        {/* Quick Public View Links */}
        <div className="flex items-center gap-1 bg-[#faf8f5] p-1 rounded-xl border border-[#e2ddd3]">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold text-[#04092b] hover:bg-white hover:text-[#c5a26c] rounded-lg transition-all"
            title="Xem giao diện trang chủ đang chạy"
          >
            <Eye className="w-3.5 h-3.5 text-[#c5a26c]" />
            <span>Trang Chủ</span>
          </a>
          <Link
            href="/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold text-[#04092b] hover:bg-white hover:text-[#c5a26c] rounded-lg transition-all"
            title="Xem trang blog công khai"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#c5a26c]" />
            <span>Blog Live</span>
          </Link>
        </div>

        {/* User Role Tag */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-[#e2ddd3]">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] shadow-xs ${
                isAdmin ? 'bg-[#04092b] text-[#c5a26c] border border-[#c5a26c]/40' : 'bg-blue-600 text-white'
              }`}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-left hidden lg:block">
              <span className="block text-[12.5px] font-bold text-[#04092b] leading-tight truncate max-w-[120px]">
                {user.name}
              </span>
              <span className="block text-[10px] text-[#6e706a] uppercase font-semibold">
                {isAdmin ? 'Quản trị viên' : 'Biên tập viên'}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

