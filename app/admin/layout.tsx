'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  LayoutDashboard,
  Layers,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Eye,
  BookOpen,
  Users,
  ShieldCheck,
  Edit3
} from 'lucide-react';
import { AuthSessionUser } from '@/lib/types';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState<AuthSessionUser | null>(null);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isLoginPage) {
      fetch('/api/auth')
        .then((res) => {
          if (!res.ok) {
            router.push('/admin/login');
          } else {
            return res.json();
          }
        })
        .then((data) => {
          if (data && data.user) {
            setUser(data.user);

            // Role route guard
            if (data.user.role === 'editor') {
              if (pathname === '/admin/pages' || pathname === '/admin/users' || pathname === '/admin') {
                router.push('/admin/blog');
              }
            }
          }
          setCheckingAuth(false);
        })
        .catch(() => router.push('/admin/login'));
    } else {
      setCheckingAuth(false);
    }
  }, [pathname, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#04092b] flex items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-[#c5a26c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/admin/login');
  };

  const isAdmin = user?.role === 'admin';

  // Dynamic Navigation Items based on role
  const navItems = isAdmin
    ? [
        { label: 'Tổng quan CMS', href: '/admin', icon: LayoutDashboard },
        { label: 'Giao diện & Canvas Trang chủ', href: '/admin/pages', icon: Layers },
        { label: 'Quản lý Bài viết Blog', href: '/admin/blog', icon: FileText },
        { label: 'Thư viện Hình ảnh', href: '/admin/media', icon: ImageIcon },
        { label: 'Quản lý Tài khoản & Phân quyền', href: '/admin/users', icon: Users }
      ]
    : [
        { label: 'Quản lý Bài viết Blog', href: '/admin/blog', icon: FileText },
        { label: 'Thư viện Hình ảnh & Asset', href: '/admin/media', icon: ImageIcon }
      ];

  return (
    <div className="min-h-screen bg-[#f4f1ea] flex flex-col md:flex-row font-sans">
      {/* Sidebar Desktop */}
      <aside
        className={`hidden md:flex bg-[#04092b] text-white flex-col justify-between shrink-0 border-r border-[#c5a26c]/20 z-40 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div>
          {/* Logo & Header */}
          <div className={`p-5 border-b border-white/10 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-12 shrink-0">
                <Image
                  src="/uploads/logo-dong-hoa-property.png"
                  alt="Đông Hòa Design"
                  fill
                  className="object-contain"
                />
              </div>
              {!isCollapsed && (
                <div>
                  <h2 className="font-semibold text-[14px] text-white font-display truncate">Đông Hòa Design</h2>
                  <p className="text-[10px] text-[#c5a26c] uppercase tracking-wider font-accent">Studio CMS</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-[#c5a26c] hover:text-[#04092b] text-white transition-colors"
              title={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
            >
              {isCollapsed ? '❯' : '❮'}
            </button>
          </div>

          {/* User Profile Capsule in Sidebar */}
          {user && !isCollapsed && (
            <div className="m-3 p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-[13px] text-white shadow-sm shrink-0 ${
                  isAdmin ? 'bg-[#c5a26c] text-[#04092b]' : 'bg-blue-600'
                }`}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-[12px] text-white truncate">{user.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {isAdmin ? (
                    <span className="text-[9.5px] font-bold text-[#c5a26c] bg-[#c5a26c]/20 px-1.5 py-0.2 rounded inline-flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Admin
                    </span>
                  ) : (
                    <span className="text-[9.5px] font-bold text-blue-300 bg-blue-500/20 px-1.5 py-0.2 rounded inline-flex items-center gap-1">
                      <Edit3 className="w-3 h-3" /> Editor Blog
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="p-3 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={`flex items-center gap-3 px-3 py-3 text-[13px] font-medium transition-all rounded-xl ${
                    active
                      ? 'bg-[#c5a26c] text-[#04092b] font-bold shadow'
                      : 'text-white/80 hover:bg-white/5 hover:text-white'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            href="/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-3 py-2 bg-white/5 hover:bg-white/10 text-white text-[12px] font-medium transition-colors rounded-lg"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-[#c5a26c]" /> Xem Blog Live
            </span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-3 py-2 bg-white/5 hover:bg-white/10 text-white text-[12px] font-medium transition-colors rounded-lg"
          >
            <span className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-[#c5a26c]" /> Xem Trang chủ
            </span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-red-300 hover:text-red-100 hover:bg-red-950/40 text-[12px] font-medium transition-colors rounded-lg"
          >
            <LogOut className="w-3.5 h-3.5" /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#04092b] text-white py-2.5 px-4 flex items-center justify-between sticky top-0 z-50 border-b border-[#c5a26c]/20 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="relative h-7 w-10">
            <Image
              src="/uploads/logo-dong-hoa-property.png"
              alt="Đông Hòa Design"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <span className="font-bold text-[12.5px] block leading-tight">Đông Hòa Design CMS</span>
            {user && (
              <span className="text-[9.5px] text-[#c5a26c] block leading-tight">
                {isAdmin ? 'Quản Trị Viên' : 'Biên Tập Viên'} ({user.name})
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg bg-white/10 text-white hover:text-[#c5a26c] transition-colors"
          aria-label="Toggle navigation menu"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {sidebarOpen && (
        <div className="md:hidden bg-[#04092b] text-white p-3 space-y-1.5 border-b border-[#c5a26c]/30 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 text-[13px] font-medium rounded-xl transition-all ${
                  active ? 'bg-[#c5a26c] text-[#04092b] font-bold shadow' : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-3 mt-1 border-t border-white/10 flex justify-between items-center px-1">
            <a href="/" target="_blank" className="text-[#c5a26c] hover:underline text-[12px] font-semibold flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> Xem Trang chủ Live
            </a>
            <button
              onClick={handleLogout}
              className="text-red-300 hover:text-red-100 bg-red-950/40 px-3 py-1 rounded-lg text-[12px] font-semibold flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" /> Đăng xuất
            </button>
          </div>
        </div>
      )}

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}
