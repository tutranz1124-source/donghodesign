'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Upload,
  Link as LinkIcon,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Copy,
  Check,
  Eye,
  AlertCircle,
  HardDrive,
  FileCode,
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle2,
  X,
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
  const [modalType, setModalType] = useState<'html_upload' | 'proxy_url'>('html_upload');
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formHtmlContent, setFormHtmlContent] = useState('');
  const [formProxyUrl, setFormProxyUrl] = useState('');
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
    setModalType('html_upload');
    setFormHtmlContent('');
    setFormProxyUrl('');
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
    setModalType(page.type);
    setFormHtmlContent(page.htmlContent || '');
    setFormProxyUrl(page.proxyUrl || '');
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

      // Auto-generate title & slug if empty
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
      showToast('error', 'Vui lòng nhập tên chiến dịch Landing Page');
      return;
    }

    if (!formSlug.trim()) {
      showToast('error', 'Vui lòng nhập đường dẫn (Slug)');
      return;
    }

    if (modalType === 'html_upload' && !formHtmlContent) {
      showToast('error', 'Vui lòng chọn tải lên file HTML của LadiPage');
      return;
    }

    if (modalType === 'proxy_url' && !formProxyUrl.trim()) {
      showToast('error', 'Vui lòng nhập đường link LadiPage (https://...)');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        id: editingPage?.id,
        title: formTitle.trim(),
        slug: formSlug.trim(),
        type: modalType,
        htmlContent: modalType === 'html_upload' ? formHtmlContent : '',
        proxyUrl: modalType === 'proxy_url' ? formProxyUrl.trim() : '',
        isActive: formIsActive
      };

      const res = await fetch('/api/landing', {
        method: editingPage ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (res.ok && result.success) {
        showToast('success', editingPage ? 'Đã cập nhật Landing Page thành công' : 'Đã tạo Landing Page mới thành công');
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
            Tải lên file HTML hoặc liên kết LadiPage để chạy chiến dịch quảng cáo với tên miền{' '}
            <code className="font-mono font-bold text-[#04092b] bg-[#f4f1ea] px-1.5 py-0.5 rounded">
              donghoadesign.com/lp/...
            </code>
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
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
            <Plus className="w-4 h-4" /> Tạo Landing Page Mới
          </button>
        </div>
      </div>

      {/* 2. Storage Tracker & Quota Meter (Vercel Free Protection) */}
      <div className="bg-[#04092b] text-white p-6 rounded-3xl border border-[#c5a26c]/30 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-[#c5a26c]">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-bold text-white">Bộ Kiểm Soát Dung Lượng (Vercel Free Safe)</h3>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[11px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Trạng thái Tối ưu
                </span>
              </div>
              <p className="text-[12px] text-white/70">
                Đo lường dung lượng lưu trữ thực tế để đảm bảo website hoạt động mượt mà và an toàn trên gói Vercel Free.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-right">
            <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
              <div className="text-[11px] text-[#c5a26c] font-bold uppercase tracking-wider">Đã Sử Dụng</div>
              <div className="text-[18px] font-bold font-mono">
                {formatBytes(stats?.totalStorageBytes || 0)}{' '}
                <span className="text-[12px] text-white/60">/ 50 MB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                (stats?.storageUsagePercent || 0) > 80
                  ? 'bg-red-500'
                  : (stats?.storageUsagePercent || 0) > 50
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-[#c5a26c] to-emerald-400'
              }`}
              style={{ width: `${Math.max(2, stats?.storageUsagePercent || 0)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11.5px] text-white/60">
            <span>
              Tỷ lệ chiếm dụng: <strong>{stats?.storageUsagePercent || 0}%</strong>
            </span>
            <span>
              Tổng số trang: <strong>{stats?.totalPages || pages.length}</strong> ({stats?.activePages || 0} đang bật)
            </span>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[12px] text-white/80 border-t border-white/10">
          <div className="flex items-start gap-2">
            <span className="text-[#c5a26c] font-bold text-[14px]">💡</span>
            <span>
              <strong>Mẹo tiết kiệm 100%:</strong> Chọn chế độ <em>"Dán Link LadiPage"</em> để tiêu tốn đúng{' '}
              <strong className="text-emerald-300">0 KB</strong> dung lượng lưu trữ trên Vercel.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[#c5a26c] font-bold text-[14px]">⚡</span>
            <span>
              <strong>Tốc độ tải nhanh:</strong> File HTML xuất từ LadiPage chỉ ~100 KB, bạn có thể tạo thoải mái hơn{' '}
              <strong>150+ Landing Page</strong>.
            </span>
          </div>
        </div>
      </div>

      {/* 3. Search & List Section */}
      <div className="bg-white rounded-3xl border border-[#e2ddd3] shadow-xs overflow-hidden">
        {/* Search Header */}
        <div className="p-4 sm:p-5 border-b border-[#e2ddd3] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#faf8f5]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#888] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên chiến dịch hoặc đường dẫn..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e2ddd3] rounded-xl text-[13px] focus:border-[#c5a26c] focus:outline-none transition-all"
            />
          </div>
          <div className="text-[12.5px] font-medium text-[#777] self-end sm:self-center">
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
              Bắt đầu tạo trang đích đầu tiên bằng cách tải file HTML từ LadiPage hoặc nhập link LadiPage.
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
                      {page.type === 'html_upload' ? (
                        <span className="px-2.5 py-0.5 rounded-md bg-[#eef7ee] text-[#2d7a36] text-[11px] font-bold border border-[#2d7a36]/20 inline-flex items-center gap-1">
                          📁 File HTML ({formatBytes(page.fileSize)})
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-md bg-[#e8f1fa] text-[#1c5f9e] text-[11px] font-bold border border-[#1c5f9e]/20 inline-flex items-center gap-1">
                          🌐 Link Proxy (0 KB)
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
                      <span className="text-[#888]">Link truy cập:</span>
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

                    {page.type === 'proxy_url' && page.proxyUrl && (
                      <div className="text-[11.5px] text-[#888] truncate">
                        🔗 Nguồn LadiPage: <span className="font-mono text-[#555]">{page.proxyUrl}</span>
                      </div>
                    )}
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

      {/* 4. Modal: Create / Edit Landing Page */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#e2ddd3] overflow-hidden my-8 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 bg-[#faf8f5] border-b border-[#e2ddd3] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-[#04092b] text-[#c5a26c] rounded-xl">
                  {editingPage ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
                <div>
                  <h3 className="text-[16px] font-bold text-[#04092b]">
                    {editingPage ? 'Chỉnh Sửa Landing Page' : 'Tạo Landing Page Mới'}
                  </h3>
                  <p className="text-[11.5px] text-[#777]">
                    Cấu hình đường dẫn và phương thức tải lên trang LadiPage.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-[#e2ddd3] text-[#777] hover:text-[#04092b] flex items-center justify-center font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Field 1: Campaign Title */}
              <div className="space-y-1.5">
                <label className="block text-[12.5px] font-bold text-[#04092b]">
                  1. Tên Chiến Dịch Landing Page <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ví dụ: Ưu Đãi Thiết Kế Biệt Thự Hiện Đại Tháng 10"
                  className="w-full p-3 bg-[#faf8f5] border border-[#e2ddd3] rounded-xl text-[13.5px] font-semibold text-[#04092b] focus:bg-white focus:border-[#c5a26c] focus:outline-none transition-all"
                />
              </div>

              {/* Field 2: Slug */}
              <div className="space-y-1.5">
                <label className="block text-[12.5px] font-bold text-[#04092b]">
                  2. Đường Dẫn Hiển Thị (Slug URL) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center rounded-xl border border-[#e2ddd3] bg-[#faf8f5] overflow-hidden focus-within:border-[#c5a26c] focus-within:bg-white transition-all">
                  <span className="px-3.5 py-3 text-[12.5px] font-mono text-[#888] bg-[#f0ece1] border-r border-[#e2ddd3] select-none shrink-0">
                    donghoadesign.com/lp/
                  </span>
                  <input
                    type="text"
                    required
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="khuyen-mai-thang-10"
                    className="w-full p-3 bg-transparent text-[13.5px] font-mono font-bold text-[#04092b] focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-[#888]">
                  👉 Khách hàng và các kênh quảng cáo sẽ truy cập tại:{' '}
                  <strong className="text-[#04092b]">
                    https://donghoadesign.com/lp/{formSlug || 'ten-duong-dan'}
                  </strong>
                </p>
              </div>

              {/* Field 3: Implementation Type Selector */}
              <div className="space-y-2 pt-2 border-t border-[#f0ece1]">
                <label className="block text-[12.5px] font-bold text-[#04092b]">
                  3. Chọn Phương Thức Triển Khai:
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setModalType('html_upload')}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                      modalType === 'html_upload'
                        ? 'bg-[#04092b] text-white border-[#04092b] shadow-md'
                        : 'bg-[#faf8f5] text-[#555] border-[#e2ddd3] hover:border-[#c5a26c]'
                    }`}
                  >
                    <span className="text-[20px]">📁</span>
                    <div>
                      <div className="text-[12.5px] font-bold">Tải Lên File HTML</div>
                      <div className={`text-[10.5px] ${modalType === 'html_upload' ? 'text-white/70' : 'text-[#888]'}`}>
                        File xuất từ LadiPage (Tải siêu tốc)
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalType('proxy_url')}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                      modalType === 'proxy_url'
                        ? 'bg-[#04092b] text-white border-[#04092b] shadow-md'
                        : 'bg-[#faf8f5] text-[#555] border-[#e2ddd3] hover:border-[#c5a26c]'
                    }`}
                  >
                    <span className="text-[20px]">🌐</span>
                    <div>
                      <div className="text-[12.5px] font-bold">Dán Link LadiPage</div>
                      <div className={`text-[10.5px] ${modalType === 'proxy_url' ? 'text-white/70' : 'text-[#888]'}`}>
                        Tiêu tốn 0 KB dung lượng Vercel
                      </div>
                    </div>
                  </button>
                </div>

                {/* Sub-panel: File HTML Upload */}
                {modalType === 'html_upload' && (
                  <div className="p-4 bg-[#faf8f5] rounded-2xl border border-dashed border-[#c5a26c] space-y-3 mt-3 animate-in fade-in duration-200">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".html,.htm"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {uploadFileName ? (
                      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-emerald-300">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          <div>
                            <div className="text-[12.5px] font-bold text-[#04092b] truncate max-w-xs">
                              {uploadFileName}
                            </div>
                            <div className="text-[11px] text-[#666]">Dung lượng: {formatBytes(uploadFileSize)}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 bg-[#f4f1ea] hover:bg-[#e2ddd3] text-[#04092b] rounded-lg text-[11.5px] font-bold transition-colors"
                        >
                          Chọn file khác
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="py-8 text-center cursor-pointer hover:bg-white/80 transition-colors rounded-xl flex flex-col items-center justify-center gap-2"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#04092b] text-[#c5a26c] flex items-center justify-center shadow-md">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-[#04092b]">
                            Bấm vào đây để chọn file HTML từ máy tính
                          </p>
                          <p className="text-[11px] text-[#888]">Chấp nhận định dạng .html (Tối đa 2 MB)</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-panel: Proxy Link */}
                {modalType === 'proxy_url' && (
                  <div className="p-4 bg-[#e8f1fa]/60 rounded-2xl border border-[#c8daf0] space-y-2 mt-3 animate-in fade-in duration-200">
                    <label className="block text-[12px] font-bold text-[#1c5f9e]">
                      👉 Nhập đường link LadiPage của bạn:
                    </label>
                    <input
                      type="url"
                      required={modalType === 'proxy_url'}
                      value={formProxyUrl}
                      onChange={(e) => setFormProxyUrl(e.target.value)}
                      placeholder="https://ladipage.me/dong-hoa-biet-thu-hien-dai"
                      className="w-full p-3 bg-white border border-[#1c5f9e]/40 rounded-xl text-[13px] font-mono text-[#04092b] focus:border-[#1c5f9e] focus:outline-none"
                    />
                    <p className="text-[11px] text-[#1c5f9e]">
                      💡 Hệ thống sẽ tự động bắt cầu hiển thị nguyên bản toàn bộ giao diện từ link LadiPage trên mà không tốn dung lượng lưu trữ.
                    </p>
                  </div>
                )}
              </div>

              {/* Field 4: Active Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-[#faf8f5] rounded-xl border border-[#e2ddd3]">
                <div>
                  <div className="text-[12.5px] font-bold text-[#04092b]">Kích hoạt Landing Page ngay</div>
                  <div className="text-[11px] text-[#777]">
                    Cho phép khách hàng và các chiến dịch quảng cáo truy cập ngay sau khi lưu.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-5 h-5 accent-[#04092b] cursor-pointer"
                />
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f0ece1]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-[#f4f1ea] hover:bg-[#e2ddd3] text-[#04092b] text-[13px] font-bold rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#04092b] hover:bg-[#c5a26c] text-white hover:text-[#04092b] text-[13px] font-bold rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Đang lưu...
                    </>
                  ) : editingPage ? (
                    'Cập Nhật Landing Page'
                  ) : (
                    'Xuất Bản Landing Page'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Live Preview Lightbox Modal */}
      {previewSlug && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md p-4 sm:p-6 flex flex-col items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-6xl h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-[#e2ddd3]">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#e2ddd3] flex items-center justify-between bg-[#faf8f5]">
              <div className="flex items-center gap-3">
                <span className="text-[13.5px] font-bold text-[#04092b] flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-[#c5a26c]" /> Xem Trước: /lp/{previewSlug}
                </span>

                {/* Device Switcher */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#e2ddd3]">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`px-3 py-1 text-[11.5px] font-bold rounded-lg flex items-center gap-1.5 transition-colors ${
                      previewDevice === 'desktop' ? 'bg-[#04092b] text-[#c5a26c]' : 'text-[#666]'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" /> Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`px-3 py-1 text-[11.5px] font-bold rounded-lg flex items-center gap-1.5 transition-colors ${
                      previewDevice === 'mobile' ? 'bg-[#04092b] text-[#c5a26c]' : 'text-[#666]'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Mobile
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`/lp/${previewSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white hover:bg-[#04092b] hover:text-white border border-[#e2ddd3] text-[#04092b] text-[12px] font-bold rounded-lg transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Mở Tab Mới
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewSlug(null)}
                  className="w-8 h-8 rounded-full bg-white border border-[#e2ddd3] hover:bg-[#04092b] hover:text-white flex items-center justify-center font-bold transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body: Iframe */}
            <div className="flex-1 bg-[#222] p-4 flex items-center justify-center overflow-hidden">
              <div
                className={`transition-all duration-300 bg-white h-full shadow-2xl rounded-2xl overflow-hidden ${
                  previewDevice === 'desktop' ? 'w-full' : 'w-[390px] border-4 border-[#444]'
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
