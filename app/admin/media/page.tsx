'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Upload, Trash2, Copy, Check, Search, Image as ImageIcon, Plus, Filter } from 'lucide-react';
import { MediaItem } from '@/lib/types';

export default function AdminMediaLibraryPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [uploadCategory, setUploadCategory] = useState<string>('Asset');

  const loadMedia = () => {
    fetch('/api/media').then(r => r.json()).then((json) => {
      if (Array.isArray(json)) setMedia(json);
    });
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const data = new FormData();
      data.append('file', file);
      data.append('category', uploadCategory);
      data.append('altText', file.name.replace(/\.[^/.]+$/, ''));

      await fetch('/api/media', {
        method: 'POST',
        body: data
      });
    }
    setUploading(false);
    loadMedia();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa file này?')) return;
    const res = await fetch(`/api/media?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setMedia(media.filter(m => m.id !== id));
    }
  };

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = [
    { id: 'all', label: 'Tất cả ảnh' },
    { id: 'Asset', label: '🪑 Đồ Nội Thất (Asset)' },
    { id: 'Styles', label: '🛋️ Phong Cách (Styles)' },
    { id: 'Hero', label: '🖼️ Hero Slideshow' },
    { id: 'Philosophy', label: '🧭 Tầm Nhìn & Sứ Mệnh' },
    { id: 'Contact', label: '💬 Kết Nối & Báo Giá' },
    { id: 'Office', label: '💼 Nội Thất Văn Phòng' },
    { id: 'Branding', label: '🏢 Thương Hiệu' }
  ];

  const filtered = media.filter(m => {
    const matchSearch =
      (m.fileName && m.fileName.toLowerCase().includes(search.toLowerCase())) ||
      (m.altText && m.altText.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = selectedCategory === 'all' || m.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="p-3.5 sm:p-6 lg:p-10 max-w-[1440px] mx-auto space-y-5 sm:space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#e2ddd3] bg-white p-4 sm:p-6 shadow-sm rounded-2xl sm:rounded-3xl">
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-[#c5a26c] uppercase tracking-widest bg-[#04092b] px-2.5 py-0.5 rounded font-accent">
            KHO TÀI NGUYÊN MEDIA
          </span>
          <h1 className="text-[22px] sm:text-[30px] font-bold text-[#04092b] font-display">
            Thư Viện Hình Ảnh &amp; Asset
          </h1>
          <p className="text-[12.5px] sm:text-[13px] text-[#6e706a]">
            Tải lên, phân loại hình ảnh theo danh mục (Đồ nội thất, Phong cách, Hero, Văn phòng, Liên hệ).
          </p>
        </div>

        {/* Upload Box with Category Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-[#faf8f5] p-2.5 rounded-2xl border border-[#e2ddd3] w-full md:w-auto">
          <div className="flex flex-col flex-1">
            <span className="text-[10px] font-bold text-[#6e706a] uppercase mb-0.5">Tải lên danh mục:</span>
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              className="p-1.5 bg-white border border-[#e2ddd3] rounded-lg font-bold text-[12px] text-[#04092b] focus:outline-none"
            >
              <option value="Asset">🪑 Đồ Nội Thất (Asset)</option>
              <option value="Styles">🛋️ Phong Cách (Styles)</option>
              <option value="Hero">🖼️ Hero Slideshow</option>
              <option value="Philosophy">🧭 Tầm Nhìn & Sứ Mệnh</option>
              <option value="Contact">💬 Kết Nối & Báo Giá</option>
              <option value="Office">💼 Nội Thất Văn Phòng</option>
              <option value="Branding">🏢 Thương Hiệu</option>
            </select>
          </div>

          <label className="cursor-pointer bg-[#04092b] hover:bg-[#c5a26c] text-white hover:text-[#04092b] px-5 py-2.5 text-[12.5px] sm:text-[13px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-md rounded-xl">
            <Upload className="w-4 h-4 shrink-0" />
            <span>{uploading ? 'Đang tải lên...' : 'Tải Ảnh Mới'}</span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
          </label>
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="space-y-3 sm:space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 sm:px-4 py-2 rounded-xl text-[12px] sm:text-[12.5px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-[#04092b] text-[#c5a26c] border-[#04092b] shadow-sm ring-1 ring-[#c5a26c]'
                  : 'bg-white text-[#04092b] border-[#e2ddd3] hover:bg-[#f4f1ea]'
              }`}
            >
              <span>{cat.label}</span>
              <span className="text-[10px] sm:text-[10.5px] bg-black/10 px-1.5 py-0.5 rounded-full font-mono">
                {cat.id === 'all'
                  ? media.length
                  : media.filter((m) => m.category === cat.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="bg-white p-3.5 sm:p-4 border border-[#e2ddd3] shadow-sm rounded-2xl flex items-center gap-3">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm hình ảnh theo tên file, mô tả..."
            className="w-full text-[13px] sm:text-[14px] focus:outline-none"
          />
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-[#e2ddd3] hover:border-[#c5a26c] shadow-sm rounded-2xl group overflow-hidden flex flex-col justify-between"
          >
            <div className="relative h-32 sm:h-44 bg-white overflow-hidden p-2 sm:p-3 border-b border-[#e2ddd3] flex items-center justify-center">
              <Image
                src={item.url}
                alt={item.altText || item.fileName || 'Media image'}
                fill
                className="object-contain group-hover:scale-105 transition-transform duration-300 p-1.5 sm:p-2"
              />
              <span className="absolute top-2 left-2 text-[9px] sm:text-[10px] font-bold text-[#04092b] bg-[#f4f1ea] px-1.5 sm:px-2 py-0.5 rounded shadow border border-[#e2ddd3]">
                {item.category || 'Asset'}
              </span>
            </div>

            <div className="p-2.5 sm:p-3.5 space-y-1.5 sm:space-y-2">
              <p className="text-[12px] sm:text-[13px] font-bold text-[#04092b] truncate" title={item.altText || item.fileName}>
                {item.altText || item.fileName}
              </p>
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#6e706a] font-mono">
                <span className="truncate max-w-[80px] sm:max-w-[120px]">{item.fileName}</span>
                <span>{item.uploadedAt || 'Figma'}</span>
              </div>

              <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-[#e2ddd3]">
                <button
                  onClick={() => copyUrl(item.url, item.id)}
                  className="text-[11px] sm:text-[11.5px] font-bold text-[#c5a26c] hover:underline flex items-center gap-1"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600" /> <span className="truncate">Đã copy</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> <span className="truncate">Copy URL</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-400 hover:text-red-700 p-1"
                  title="Xóa hình ảnh"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
