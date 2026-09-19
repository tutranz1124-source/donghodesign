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
  Edit3,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { AuthSessionUser } from '@/lib/types';
import { ToastProvider } from '@/components/admin/ToastContext';
import AdminHeader from '@/components/admin/AdminHeader';

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
    return <ToastProvider>{children}</ToastProvider>;
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#04092b] flex flex-col items-center justify-center text-white gap-3">
        <div className="w-10 h-10 border-3 border-[#c5a26c] border-t-transparent rounded-full animate-spin" />
        <p className="text-[13px] font-bold text-[#c5a26c] uppercase tracking-wider font-accent">
          Đang tải không gian quản trị...
        </p>
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
        { label: 'Tổng Quan Bảng Điều Khiển', href: '/admin', icon: LayoutDashboard, badge: 'Overview' },
        { label: 'Giao Diện & Canvas Trang Chủ', href: '/admin/pages', icon: Layers, badge: '10 Frames' },
        { label: 'Quản Lý Bài Viết Blog', href: '/admin/blog', icon: FileText, badge: 'Tin tức' },
        { label: 'Thư Viện Hình Ảnh & Asset', href: '/admin/media', icon: ImageIcon, badge: 'Media' },
        { label: 'Tài Khoản & Phân Quyền', href: '/admin/users', icon: Users, badge: 'Security' }
      ]
    : [
        { label: 'Quản Lý Bài Viết Blog', href: '/admin/blog', icon: FileText, badge: 'Tin tức' },
        { label: 'Thư Viện Hình Ảnh & Asset', href: '/admin/media', icon: ImageIcon, badge: 'Media' }
      ];

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#f4f1ea] flex flex-col md:flex-row font-sans selection:bg-[#c5a26c] selection:text-[#04092b]">
        {/* Sidebar Desktop */}
        <aside
          className={`hidden md:flex bg-[#04092b] text-white flex-col justify-between shrink-0 border-r border-[#c5a26c]/20 z-40 transition-all duration-300 sticky top-0 h-screen ${
            isCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          <div className="flex flex-col flex-1 overflow-y-auto">
            {/* Logo & Header */}
            <div
              className={`p-4 border-b border-white/10 flex items-center ${
                isCollapsed ? 'justify-center flex-col gap-2' : 'justify-between'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative h-9 w-11 shrink-0">
                  <Image
                    src="/uploads/logo-dong-hoa-property.png"
                    alt="Đông Hòa Design"
                    fill
                    className="object-contain"
                  />
                </div>
                {!isCollapsed && (
                  <div>
                    <h2 className="font-bold text-[14px] text-white font-display truncate">Đông Hòa Design</h2>
                    <p className="text-[9.5px] text-[#c5a26c] uppercase tracking-wider font-accent">Studio CMS v2.0</p>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-[#c5a26c] hover:text-[#04092b] text-white transition-all"
                title={isCollapsed ? 'Mở rộng thanh menu' : 'Thu gọn thanh menu'}
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>

            {/* User Profile Capsule in Sidebar */}
            {user && !isCollapsed && (
              <div className="m-3 p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-[13px] shadow-sm shrink-0 ${
                    isAdmin ? 'bg-[#c5a26c] text-[#04092b]' : 'bg-blue-600 text-white'
                  }`}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-[12.5px] text-white truncate">{user.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {isAdmin ? (
                      <span className="text-[9.5px] font-bold text-[#c5a26c] bg-[#c5a26c]/20 px-1.5 py-0.5 rounded-md inline-flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Admin
                      </span>
                    ) : (
                      <span className="text-[9.5px] font-bold text-blue-300 bg-blue-500/20 px-1.5 py-0.5 rounded-md inline-flex items-center gap-1">
                        <Edit3 className="w-3 h-3" /> Editor Blog
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <nav className="p-3 space-y-1.5 flex-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    className={`flex items-center gap-3 px-3.5 py-2.5 text-[13px] font-medium transition-all rounded-xl relative group ${
                      active
                        ? 'bg-[#c5a26c] text-[#04092b] font-bold shadow-md'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}
                    {/* Collapsed Tooltip */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2.5 py-1 bg-[#04092b] text-white text-[12px] font-bold rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-[#c5a26c]/40 shadow-xl">
                        {item.label}
                      </div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Actions */}
          <div className="p-3 border-t border-white/10 space-y-1.5">
            <Link
              href="/blog"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-white text-[12px] font-medium transition-colors rounded-xl ${
                isCollapsed ? 'justify-center' : 'justify-between'
              }`}
              title="Xem trang blog công khai"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-[#c5a26c]" />
                {!isCollapsed && 'Xem Blog Live'}
              </span>
              {!isCollapsed && <ExternalLink className="w-3 h-3 opacity-60" />}
            </Link>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-white text-[12px] font-medium transition-colors rounded-xl ${
                isCollapsed ? 'justify-center' : 'justify-between'
              }`}
              title="Xem trang chủ công khai"
            >
              <span className="flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-[#c5a26c]" />
                {!isCollapsed && 'Xem Trang Chủ'}
              </span>
              {!isCollapsed && <ExternalLink className="w-3 h-3 opacity-60" />}
            </a>

            <button
              onClick={handleLogout}
              className={`flex items-center gap-2 w-full px-3 py-2 text-red-300 hover:text-red-100 hover:bg-red-950/50 text-[12px] font-semibold transition-colors rounded-xl ${
                isCollapsed ? 'justify-center' : ''
              }`}
              title="Đăng xuất khỏi hệ thống"
            >
              <LogOut className="w-3.5 h-3.5" />
              {!isCollapsed && 'Đăng xuất'}
            </button>
          </div>
        </aside>

        {/* Mobile Top Navigation Bar */}
        <div className="md:hidden bg-[#04092b] text-white py-3 px-4 flex items-center justify-between sticky top-0 z-50 border-b border-[#c5a26c]/30 shadow-md">
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
              <span className="font-bold text-[13px] block leading-tight">Đông Hòa Design CMS</span>
              {user && (
                <span className="text-[10px] text-[#c5a26c] block leading-tight">
                  {isAdmin ? 'Quản Trị Viên' : 'Biên Tập Viên'} ({user.name})
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl bg-white/10 text-white hover:text-[#c5a26c] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Slide-Over Drawer with Backdrop */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Drawer Content */}
            <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-[#04092b] text-white p-5 space-y-4 shadow-2xl flex flex-col justify-between border-l border-[#c5a26c]/30 animate-in slide-in-from-right duration-200 z-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#c5a26c]" />
                    <span className="font-bold text-[14px]">Menu Quản Trị</span>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 rounded-lg text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-3 text-[13.5px] font-medium rounded-xl transition-all ${
                          active
                            ? 'bg-[#c5a26c] text-[#04092b] font-bold shadow-md'
                            : 'text-white/80 hover:bg-white/10'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="space-y-2 pt-3 border-t border-white/10">
                <a
                  href="/"
                  target="_blank"
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/10 hover:bg-white/20 text-[#c5a26c] text-[12.5px] font-bold rounded-xl transition-colors"
                >
                  <Eye className="w-4 h-4" /> Xem Trang Chủ Live
                </a>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-950/60 hover:bg-red-900 text-red-200 text-[12.5px] font-bold rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Đăng xuất
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          <AdminHeader user={user} />
          <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
