'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ConsultationBlock } from '@/lib/types';
import { Phone, Mail, MapPin, Send, CheckCircle2 } from 'lucide-react';

interface ConsultationSectionProps {
  block: ConsultationBlock;
  onOpenInquiry?: (defaultMsg?: string) => void;
}

export default function ConsultationSection({ block }: ConsultationSectionProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    propertyType: 'Căn hộ',
    need: 'Thiết kế & Thi công trọn gói'
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contact" className="w-full py-20 lg:py-28 px-4 sm:px-8 lg:px-20 bg-[#f4f1ea] border-t border-[#e2ddd3]">
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Stylized Contact Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-5 space-y-6"
        >
          {/* Stylized Drop Cap "L" + "iên hệ ngay" */}
          <div className="flex items-start gap-3">
            <span className="text-[64px] sm:text-[80px] font-display text-[#c5a26c] leading-none font-bold select-none">
              L
            </span>
            <div className="pt-2">
              <span className="block text-[28px] sm:text-[36px] font-display font-medium text-[#04092b]">
                iên hệ ngay
              </span>
              <span className="block text-[12px] font-semibold tracking-widest text-[#a70c0c] uppercase font-accent">
                KẾT NỐI CÙNG ĐÔNG HÒA DESIGN
              </span>
            </div>
          </div>

          <p className="text-[15px] sm:text-[16px] text-[#6e706a] font-light leading-relaxed">
            &ldquo;Để lại thông tin, đội ngũ Kiến trúc sư Đông Hòa Design sẽ liên hệ tư vấn trực tiếp và gửi báo giá chi tiết trong vòng 15 phút.&rdquo;
          </p>

          <div className="bg-white p-6 sm:p-8 border border-[#e2ddd3] shadow-sm space-y-4">
            <div className="flex items-start gap-3.5">
              <Phone className="w-5 h-5 text-[#c5a26c] shrink-0 mt-0.5" />
              <div>
                <span className="block text-[11px] font-semibold uppercase text-[#6e706a]">Hotline tư vấn</span>
                <a href="tel:0906499279" className="text-[17px] font-bold text-[#04092b] hover:text-[#c5a26c] transition-colors">
                  0906.499.279
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3.5 border-t border-[#e2ddd3] pt-3.5">
              <Mail className="w-5 h-5 text-[#c5a26c] shrink-0 mt-0.5" />
              <div>
                <span className="block text-[11px] font-semibold uppercase text-[#6e706a]">Email hỗ trợ</span>
                <a href="mailto:info@donghoagroup.vn" className="text-[14px] font-medium text-[#04092b] hover:text-[#c5a26c]">
                  info@donghoagroup.vn
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3.5 border-t border-[#e2ddd3] pt-3.5">
              <MapPin className="w-5 h-5 text-[#c5a26c] shrink-0 mt-0.5" />
              <div>
                <span className="block text-[11px] font-semibold uppercase text-[#6e706a]">Văn phòng làm việc</span>
                <p className="text-[13.5px] text-[#04092b] font-normal leading-snug">
                  113-115 Ung Văn Khiêm, Phường Thạnh Mỹ Tây, TP.HCM
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Exact Form from Figma */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="lg:col-span-7 bg-white p-8 sm:p-10 border border-[#e2ddd3] shadow-lg space-y-6"
        >
          <div className="border-b border-[#e2ddd3] pb-4">
            <h3 className="text-[22px] font-medium text-[#04092b] font-display">
              Đăng Ký Tư Vấn & Nhận Báo Giá
            </h3>
            <p className="text-[13px] text-[#6e706a]">
              Khảo sát hiện trạng và tư vấn miễn phí tận nơi bởi KTS chuyên nghiệp.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 text-center bg-green-50 border border-green-200 text-green-800 space-y-3">
              <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
              <h4 className="text-[18px] font-bold">Gửi yêu cầu thành công!</h4>
              <p className="text-[14px]">
                Đội ngũ Kiến trúc sư Đông Hòa Design sẽ liên hệ qua số điện thoại <strong>{formData.phone}</strong> trong vòng 15 phút.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold uppercase text-[#1a1b18] mb-1">
                  Họ và tên: *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Nhập họ và tên của bạn..."
                  className="w-full p-3 border border-[#e2ddd3] text-[14px] focus:outline-none focus:border-[#c5a26c] bg-white"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold uppercase text-[#1a1b18] mb-1">
                  Số điện thoại: *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="090x xxx xxx"
                  className="w-full p-3 border border-[#e2ddd3] text-[14px] focus:outline-none focus:border-[#c5a26c] bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold uppercase text-[#1a1b18] mb-1">
                    Loại hình nhà:
                  </label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                    className="w-full p-3 border border-[#e2ddd3] text-[14px] focus:outline-none focus:border-[#c5a26c] bg-white"
                  >
                    <option value="Căn hộ">Căn hộ cao cấp</option>
                    <option value="Nhà phố">Nhà phố thương mại</option>
                    <option value="Biệt thự">Biệt thự / Villa</option>
                    <option value="Văn phòng">Văn phòng / Showroom</option>
                    <option value="Khác">Loại hình khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold uppercase text-[#1a1b18] mb-1">
                    Nhu cầu:
                  </label>
                  <select
                    value={formData.need}
                    onChange={(e) => setFormData({ ...formData, need: e.target.value })}
                    className="w-full p-3 border border-[#e2ddd3] text-[14px] focus:outline-none focus:border-[#c5a26c] bg-white"
                  >
                    <option value="Thiết kế nội thất">Thiết kế nội thất</option>
                    <option value="Thi công trọn gói">Thi công trọn gói</option>
                    <option value="Sản xuất nội thất">Sản xuất nội thất theo yêu cầu</option>
                    <option value="Tư vấn toàn diện">Tư vấn toàn diện</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#04092b] hover:bg-[#c5a26c] text-white hover:text-[#04092b] py-3.5 px-6 text-[13px] font-semibold uppercase tracking-widest transition-all duration-300 shadow-md flex items-center justify-center gap-2 group"
                >
                  <span>GỬI YÊU CẦU</span>
                  <Send className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
