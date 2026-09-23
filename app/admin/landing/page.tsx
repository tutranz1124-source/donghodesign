'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Upload,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Copy,
  Eye,
  HardDrive,
  FileCode,
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle2,
  Smartphone,
  Monitor
} from 'lucide-react';
import { LandingPageItem, LandingPageStats } from '@/lib/types';
import { useToast } from '@/components/admin/ToastContext';

export default function AdminLandingPages() {
  const { showToast } = useToast();
  const [pages, setPages] = useState<LandingPageItem[]>([]);
  const [stats, setStats] = useState<LandingPageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<LandingPageItem | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formHtmlContent, setFormHtmlContent] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileSize, setUploadFileSize] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preview Modal
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch landing pages & storage stats
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/landing');
      if (res.ok) {
        const data = await res.json();
        setPages(data.pages || []);
        setStats(data.stats || null);
      } else {
        showToast('error', 'Không thể tải danh sách Landing Page');
      }
    } catch (err) {
      showToast('error', 'Lỗi kết nối khi tải Landing Page');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Format bytes to human readable string
  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingPage(null);
    setFormTitle('');
    setFormSlug('');
    setFormHtmlContent('');
    setFormIsActive(true);
    setUploadFileName('');
    setUploadFileSize(0);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (page: LandingPageItem) => {
    setEditingPage(page);
    setFormTitle(page.title);
    setFormSlug(page.slug);
    setFormHtmlContent(page.htmlContent || '');
    setFormIsActive(page.isActive);
    setUploadFileName(page.type === 'html_upload' ? `${page.slug}.html` : '');
    setUploadFileSize(page.fileSize || 0);
    setIsModalOpen(true);
  };

  // Handle HTML File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      showToast('error', 'Vui lòng chọn file định dạng .html hoặc .htm');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('error', 'Dung lượng file vượt quá giới hạn 2 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFormHtmlContent(content);
      setUploadFileName(file.name);
      setUploadFileSize(file.size);

      // Auto-fill title & slug if empty
      if (!formTitle) {
        const rawName = file.name.replace(/\.[^/.]+$/, '');
        setFormTitle(rawName);
        if (!formSlug) {
          setFormSlug(
            rawName
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/đ/g, 'd')
              .replace(/[^a-z0-9-_]/g, '-')
          );
        }
      }
      showToast('success', `Đã tải lên file "${file.name}" (${formatBytes(file.size)})`);
    };
    reader.readAsText(file);
  };

  // Submit Save Landing Page
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      showToast('error', 'Vui lòng nhập tên chiến dịch');
      return;
    }

    if (!formSlug.trim()) {
      showToast('error', 'Vui lòng nhập đường dẫn (Slug)');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        id: editingPage?.id,
        title: formTitle.trim(),
        slug: formSlug.trim(),
        type: formHtmlContent ? 'html_upload' : 'proxy_url',
        htmlContent: formHtmlContent || '',
        proxyUrl: '',
        isActive: formIsActive
      };

      const res = await fetch('/api/landing', {
        method: editingPage ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (res.ok && result.success) {
        showToast('success', editingPage ? 'Đã cập nhật Landing Page thành công' : 'Đã tạo Landing Page thành công!');
        setIsModalOpen(false);
        loadData();
      } else {
        showToast('error', result.error || 'Có lỗi xảy ra khi lưu Landing Page');
      }
    } catch (err: any) {
      showToast('error', 'Lỗi kết nối máy chủ: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Active State
  const handleToggleActive = async (page: LandingPageItem) => {
    try {
      const res = await fetch('/api/landing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: page.id,
          isActive: !page.isActive
        })
      });

      if (res.ok) {
        showToast('success', `Đã ${!page.isActive ? 'kích hoạt' : 'tạm ngưng'} trang /lp/${page.slug}`);
        setPages((prev) => prev.map((p) => (p.id === page.id ? { ...p, isActive: !p.isActive } : p)));
        loadData();
      }
    } catch (e) {
      showToast('error', 'Không thể đổi trạng thái');
    }
  };

  // Delete Landing Page
  const handleDelete = async (page: LandingPageItem) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa Landing Page "${page.title}" (/lp/${page.slug})?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/landing?id=${page.id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('success', 'Đã xóa Landing Page và thu hồi dung lượng lưu trữ');
        loadData();
      } else {
        const data = await res.json();
        showToast('error', data.error || 'Không thể xóa');
      }
    } catch (e) {
      showToast('error', 'Lỗi khi xóa Landing Page');
    }
  };

  // Copy Public Link
  const handleCopyLink = (slug: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://donghoadesign.com';
    const fullUrl = `${origin}/lp/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    showToast('success', `Đã sao chép link: ${fullUrl}`);
  };

  // Filtered pages
  const filteredPages = pages.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#e2ddd3] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-[#04092b] text-[#c5a26c]">
              <Globe className="w-5 h-5" />
            </span>
            <h1 className="text-[20px] font-bold text-[#04092b] font-display">
              Quản Lý Landing Page (LadiPage)
            </h1>
          </div>
          <p className="text-[13px] text-[#666]">
            Đồng bộ và quản lý các trang đích quảng cáo chiến dịch với tên miền{' '}
            <code className="font-mono font-bold text-[#04092b] bg-[#f4f1ea] px-1.5 py-0.5 rounded">
              donghoadesign.com/lp/...
            </code>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
          {/* Direct LadiPage Studio shortcut */}
          <a
            href="https://builder.ladipage.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3 bg-[#faf8f5] hover:bg-[#f4f1ea] border border-[#e2ddd3] text-[#04092b] rounded-2xl text-[13px] font-bold transition-all shadow-xs inline-flex items-center gap-2"
            title="Mở trình thiết kế LadiPage trên tab mới"
          >
            <Sparkles className="w-4 h-4 text-[#c5a26c]" /> Mở LadiPage Studio
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </a>

          <button
            type="button"
            onClick={loadData}
            className="p-3 bg-[#faf8f5] hover:bg-[#f4f1ea] border border-[#e2ddd3] text-[#04092b] rounded-2xl transition-colors shrink-0"
            title="Tải lại dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="flex-1 sm:flex-initial px-5 py-3 bg-[#04092b] hover:bg-[#c5a26c] text-white hover:text-[#04092b] text-[13px] font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Tạo Trang Mới
          </button>
        </div>
      </div>

      {/* 2. DNS Quick Setup Guide Box (Clean & Concise for tomorrow) */}
      <div className="bg-gradient-to-br from-[#faf8f5] to-[#f4f1ea] border border-[#e2ddd3] p-5 sm:p-6 rounded-3xl space-y-3 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-[18px]">📌</span>
          <h3 className="text-[14.5px] font-bold text-[#04092b]">
            Cấu Hình Tên Miền Cho LadiPage (Làm 1 Lần Duy Nhất)
          </h3>
        </div>
        <p className="text-[12.5px] text-[#555] leading-relaxed">
          Hệ thống website đã được cấu hình sẵn tính năng <strong>bắc cầu tự động</strong>. Ngày mai khi bạn truy cập trang quản lý tên miền (DNS), chỉ cần làm 2 bước đơn giản sau:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 bg-white rounded-2xl border border-[#e2ddd3] space-y-1">
            <span className="text-[11px] font-bold text-[#c5a26c] uppercase tracking-wider">Bước 1: Trỏ DNS Tên Miền</span>
            <div className="text-[13px] font-semibold text-[#04092b]">
              Thêm bản ghi <code className="bg-[#f0ece1] px-1.5 py-0.5 rounded text-[#04092b] font-mono">CNAME</code>:{' '}
              <strong className="text-[#04092b]">lp</strong> &rarr; <strong className="text-[#1c5f9e]">dns.ladipage.com</strong>
            </div>
            <p className="text-[11px] text-[#777]">Thực hiện tại trang quản lý tên miền nơi bạn mua domain.</p>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-[#e2ddd3] space-y-1">
            <span className="text-[11px] font-bold text-[#c5a26c] uppercase tracking-wider">Bước 2: Xuất Bản Trên LadiPage</span>
            <div className="text-[13px] font-semibold text-[#04092b]">
              Xuất bản trang với tên bất kỳ dạng:{' '}
              <code className="bg-[#f0ece1] px-1.5 py-0.5 rounded text-[#04092b] font-mono">lp.donghoadesign.com/...</code>
            </div>
            <p className="text-[11px] text-[#777]">
              Website sẽ tự động hiển thị tại <strong className="text-[#04092b]">donghoadesign.com/lp/...</strong> với dung lượng <strong>0 KB</strong>!
            </p>
          </div>
        </div>
      </div>

      {/* 3. Storage Status Overview Bar */}
      <div className="bg-[#04092b] text-white p-5 sm:p-6 rounded-3xl border border-[#c5a26c]/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-[#c5a26c] shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-[14.5px] font-bold text-white">Kiểm Soát Dung Lượng (Vercel Free)</h4>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[10.5px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Tối Ưu An Toàn
              </span>
            </div>
            <p className="text-[12px] text-white/70">
              Chế độ kết nối LadiPage tiêu tốn <strong>0 KB</strong> dung lượng lưu trữ trên Vercel.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/5 px-4 py-2.5 rounded-2xl border border-white/10 self-start sm:self-auto">
          <div>
            <div className="text-[10.5px] text-[#c5a26c] font-bold uppercase tracking-wider">Dung lượng HTML Offline</div>
            <div className="text-[16px] font-bold font-mono">
              {formatBytes(stats?.totalStorageBytes || 0)}{' '}
              <span className="text-[11.5px] text-white/60">/ 50 MB (An toàn)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Search & List Section */}
      <div className="bg-white rounded-3xl border border-[#e2ddd3] shadow-xs overflow-hidden">
        {/* Search Header */}
        <div className="p-4 sm:p-5 border-b border-[#e2ddd3] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#faf8f5]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#888] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm chiến dịch hoặc đường dẫn..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e2ddd3] rounded-xl text-[13px] focus:border-[#c5a26c] focus:outline-none transition-all"
            />
          </div>
          <div className="text-[12px] font-medium text-[#777] self-end sm:self-center">
            Hiển thị <strong>{filteredPages.length}</strong> / {pages.length} Landing Page
          </div>
        </div>

        {/* Table / Cards */}
        {filteredPages.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#faf8f5] border border-[#e2ddd3] flex items-center justify-center text-[#c5a26c]">
              <FileCode className="w-6 h-6" />
            </div>
            <h4 className="text-[16px] font-bold text-[#04092b]">Chưa có Landing Page nào</h4>
            <p className="text-[13px] text-[#666] max-w-md mx-auto">
              Bắt đầu tạo chiến dịch đầu tiên để lấy đường link chạy quảng cáo hoặc tải file HTML offline.
            </p>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 bg-[#04092b] text-white text-[12.5px] font-bold rounded-xl hover:bg-[#c5a26c] hover:text-[#04092b] transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Tạo Trang Mới Ngay
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#f0ece1]">
            {filteredPages.map((page) => {
              const publicUrl = `/lp/${page.slug}`;
              return (
                <div
                  key={page.id}
                  className="p-4 sm:p-5 hover:bg-[#faf8f5] transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Left: Info */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-[14.5px] text-[#04092b] truncate">{page.title}</span>

                      {/* Type Badge */}
                      {page.type === 'html_upload' && page.fileSize > 0 ? (
                        <span className="px-2.5 py-0.5 rounded-md bg-[#eef7ee] text-[#2d7a36] text-[11px] font-bold border border-[#2d7a36]/20 inline-flex items-center gap-1">
                          📁 File HTML ({formatBytes(page.fileSize)})
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-md bg-[#e8f1fa] text-[#1c5f9e] text-[11px] font-bold border border-[#1c5f9e]/20 inline-flex items-center gap-1">
                          🌐 LadiPage Subdomain (0 KB)
                        </span>
                      )}

                      {/* Active Status Badge */}
                      {page.isActive ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-bold">
                          ● Đang chạy
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10.5px] font-bold">
                          ○ Đã tắt
                        </span>
                      )}
                    </div>

                    {/* URL link */}
                    <div className="flex flex-wrap items-center gap-2 text-[12.5px]">
                      <span className="text-[#888]">Link chạy Ads:</span>
                      <a
                        href={publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono font-bold text-[#c5a26c] hover:underline inline-flex items-center gap-1 bg-[#04092b] px-2 py-0.5 rounded-md"
                      >
                        donghoadesign.com{publicUrl}
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </a>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Copy Link */}
                    <button
                      type="button"
                      onClick={() => handleCopyLink(page.slug)}
                      className="px-3 py-2 bg-white hover:bg-[#f4f1ea] border border-[#e2ddd3] text-[#04092b] rounded-xl text-[12px] font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs"
                      title="Sao chép đường link đầy đủ để chạy quảng cáo"
                    >
                      <Copy className="w-3.5 h-3.5 text-[#c5a26c]" /> Copy Link
                    </button>

                    {/* Live Preview Modal */}
                    <button
                      type="button"
                      onClick={() => setPreviewSlug(page.slug)}
                      className="px-3 py-2 bg-white hover:bg-[#f4f1ea] border border-[#e2ddd3] text-[#04092b] rounded-xl text-[12px] font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs"
                      title="Xem trước giao diện ngay trong trang này"
                    >
                      <Eye className="w-3.5 h-3.5" /> Xem Thử
                    </button>

                    {/* Toggle Active */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(page)}
                      className={`px-3 py-2 border rounded-xl text-[12px] font-bold transition-colors ${
                        page.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                      title={page.isActive ? 'Bấm để tạm ngưng trang này' : 'Bấm để kích hoạt lại'}
                    >
                      {page.isActive ? 'Đang Bật' : 'Đang Tắt'}
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(page)}
                      className="p-2 bg-white hover:bg-[#f4f1ea] border border-[#e2ddd3] text-[#04092b] rounded-xl transition-colors"
                      title="Chỉnh sửa thông tin hoặc tải file mới"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDelete(page)}
                      className="p-2 bg-white hover:bg-red-50 border border-[#e2ddd3] text-red-500 rounded-xl transition-colors"
                      title="Xóa trang này để thu hồi dung lượng"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Clean Modal: Create / Edit Landing Page */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl max-h-[94vh] sm:max-h-[90vh] rounded-2xl sm:rounded-3xl shadow-2xl border border-[#e2ddd3] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-[#faf8f5] border-b border-[#e2ddd3] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <span className="p-1.5 sm:p-2 bg-[#04092b] text-[#c5a26c] rounded-xl shrink-0">
                  {editingPage ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
                <div className="min-w-0">
                  <h3 className="text-[14.5px] sm:text-[16px] font-bold text-[#04092b] truncate">
                    {editingPage ? 'Chỉnh Sửa Chiến Dịch' : 'Tạo Chiến Dịch Landing Page'}
                  </h3>
                  <p className="text-[10.5px] sm:text-[11.5px] text-[#777] truncate">
                    Đặt tên và đường dẫn URL cho trang đích quảng cáo.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-[#e2ddd3] text-[#777] hover:text-[#04092b] hover:bg-[#f4f1ea] flex items-center justify-center font-bold text-[13px] transition-colors shrink-0 ml-2"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {/* Field 1: Campaign Title */}
                <div className="space-y-1.5">
                  <label className="block text-[12px] sm:text-[12.5px] font-bold text-[#04092b]">
                    1. Tên Chiến Dịch <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ví dụ: Ưu Đãi Thiết Kế Biệt Thự Hiện Đại Tháng 10"
                    className="w-full p-2.5 sm:p-3 bg-[#faf8f5] border border-[#e2ddd3] rounded-xl text-[13px] sm:text-[13.5px] font-semibold text-[#04092b] focus:bg-white focus:border-[#c5a26c] focus:outline-none transition-all"
                  />
                </div>

                {/* Field 2: Slug */}
                <div className="space-y-1.5">
                  <label className="block text-[12px] sm:text-[12.5px] font-bold text-[#04092b]">
                    2. Đường Dẫn Hiển Thị (Slug URL) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center rounded-xl border border-[#e2ddd3] bg-[#faf8f5] overflow-hidden focus-within:border-[#c5a26c] focus-within:bg-white transition-all">
                    <span className="px-3 py-2 sm:py-3 text-[11px] sm:text-[12.5px] font-mono text-[#888] bg-[#f0ece1] border-b sm:border-b-0 sm:border-r border-[#e2ddd3] select-none shrink-0">
                      donghoadesign.com/lp/
                    </span>
                    <input
                      type="text"
                      required
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value)}
                      placeholder="khuyen-mai-thang-10"
                      className="w-full p-2.5 sm:p-3 bg-transparent text-[13px] sm:text-[13.5px] font-mono font-bold text-[#04092b] focus:outline-none"
                    />
                  </div>
                  <p className="text-[10.5px] sm:text-[11px] text-[#888] break-all">
                    👉 Link truy cập chính thức:{' '}
                    <strong className="text-[#04092b]">
                      https://donghoadesign.com/lp/{formSlug || 'ten-duong-dan'}
                    </strong>
                  </p>
                </div>

                {/* Field 3: Optional Offline HTML File */}
                <div className="space-y-2 pt-2 border-t border-[#f0ece1]">
                  <label className="block text-[12px] sm:text-[12.5px] font-bold text-[#04092b]">
                    3. File HTML Offline (Tùy Chọn):
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".html,.htm"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {uploadFileName ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white rounded-xl border border-emerald-300 gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[12px] font-bold text-[#04092b] truncate">{uploadFileName}</div>
                          <div className="text-[10.5px] text-[#666]">Dung lượng: {formatBytes(uploadFileSize)}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-[#f4f1ea] hover:bg-[#e2ddd3] text-[#04092b] rounded-lg text-[11px] font-bold transition-colors self-start sm:self-auto"
                      >
                        Đổi file
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3.5 bg-[#faf8f5] hover:bg-white border border-dashed border-[#c5a26c] rounded-xl cursor-pointer transition-colors flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#04092b] text-[#c5a26c] flex items-center justify-center shrink-0">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div className="text-[11.5px] text-[#666]">
                        Bấm để tải file <code className="font-mono text-[#04092b]">.html</code> nếu bạn xuất file offline (Không bắt buộc).
                      </div>
                    </div>
                  )}
                </div>

                {/* Field 4: Active Toggle */}
                <div className="flex items-center justify-between p-3 bg-[#faf8f5] rounded-xl border border-[#e2ddd3]">
                  <div>
                    <div className="text-[12px] font-bold text-[#04092b]">Kích hoạt trang ngay</div>
                    <div className="text-[10.5px] text-[#777]">Sẵn sàng nhận lượt truy cập sau khi lưu.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-5 h-5 accent-[#04092b] cursor-pointer shrink-0"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-3.5 sm:p-4 bg-white border-t border-[#f0ece1] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-[#f4f1ea] hover:bg-[#e2ddd3] text-[#04092b] text-[12.5px] font-bold rounded-xl transition-colors text-center"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#04092b] hover:bg-[#c5a26c] text-white hover:text-[#04092b] text-[12.5px] font-bold rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Đang lưu...
                    </>
                  ) : editingPage ? (
                    'Lưu Thay Đổi'
                  ) : (
                    'Tạo Trang Mới'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Live Preview Lightbox Modal */}
      {previewSlug && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md p-2 sm:p-4 md:p-6 flex flex-col items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-6xl h-[95vh] sm:h-[90vh] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-[#e2ddd3]">
            {/* Modal Header */}
            <div className="p-3 sm:p-4 border-b border-[#e2ddd3] flex flex-wrap items-center justify-between gap-2 bg-[#faf8f5] shrink-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
                <span className="text-[12.5px] sm:text-[13.5px] font-bold text-[#04092b] flex items-center gap-1.5 truncate">
                  <Eye className="w-4 h-4 text-[#c5a26c] shrink-0" /> /lp/{previewSlug}
                </span>

                {/* Device Switcher */}
                <div className="flex items-center gap-1 bg-white p-0.5 sm:p-1 rounded-xl border border-[#e2ddd3]">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`px-2.5 sm:px-3 py-1 text-[11px] sm:text-[11.5px] font-bold rounded-lg flex items-center gap-1 transition-colors ${
                      previewDevice === 'desktop' ? 'bg-[#04092b] text-[#c5a26c]' : 'text-[#666]'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" /> Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`px-2.5 sm:px-3 py-1 text-[11px] sm:text-[11.5px] font-bold rounded-lg flex items-center gap-1 transition-colors ${
                      previewDevice === 'mobile' ? 'bg-[#04092b] text-[#c5a26c]' : 'text-[#666]'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Mobile
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <a
                  href={`/lp/${previewSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 sm:px-3 py-1.5 bg-white hover:bg-[#04092b] hover:text-white border border-[#e2ddd3] text-[#04092b] text-[11px] sm:text-[12px] font-bold rounded-lg transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Mở Tab
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewSlug(null)}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-[#e2ddd3] hover:bg-[#04092b] hover:text-white flex items-center justify-center font-bold text-[13px] transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body: Iframe */}
            <div className="flex-1 bg-[#181a20] p-2 sm:p-4 flex items-center justify-center overflow-hidden">
              <div
                className={`transition-all duration-300 bg-white h-full shadow-2xl rounded-xl sm:rounded-2xl overflow-hidden ${
                  previewDevice === 'desktop'
                    ? 'w-full'
                    : 'w-full max-w-[375px] sm:h-[95%] border-2 sm:border-4 border-[#333]'
                }`}
              >
                <iframe
                  src={`/lp/${previewSlug}`}
                  title="Landing Page Preview"
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
