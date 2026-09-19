'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Send, ArrowRight, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import FlowReveal, { FlowStaggerGroup, FlowItem } from '@/components/animations/FlowReveal';
import { ContactData } from '@/lib/types';

interface QuoteContactSectionProps {
  data?: ContactData;
}

export default function QuoteContactSection({ data }: QuoteContactSectionProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    propertyType: '',
    area: '',
    need: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDismissed, setIsDismissed] = useState(false);

  const image = data?.image || '/uploads/clean_contact_photo.png';
  const tag = data?.tag || 'LIÊN HỆ NGAY VỚI CHÚNG TÔI';
  const heading = data?.heading || 'KẾT NỐI CÙNG\nĐÔNG HÒA DESIGN';
  const quote =
    data?.quote ||
    'Để lại thông tin, đội ngũ Kiến trúc sư Đông Hòa Design sẽ liên hệ tư vấn trực tiếp và gửi báo giá chi tiết trong vòng 15 phút.';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const resJson = await response.json();

      if (!response.ok || resJson.error) {
        throw new Error(resJson.error || 'Gửi yêu cầu không thành công');
      }

      setSubmitted(true);
    } catch (err: any) {
      console.error('Contact submission error:', err);
      setErrorMessage(
        err.message || 'Đã có lỗi xảy ra khi gửi yêu cầu. Quý khách vui lòng thử lại hoặc gọi trực tiếp hotline.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      phone: '',
      propertyType: '',
      area: '',
      need: ''
    });
    setSubmitted(false);
    setErrorMessage('');
  };

  return (
    <section id="contact" className="w-full py-16 sm:py-20 lg:py-24 bg-[#f4f1ea] border-b border-[#e2ddd3] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-20">
        <div className="max-w-[1280px] mx-auto flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-14 xl:gap-16 items-center">
          
          {/* LEFT SIDE: Rounded Rectangle Image */}
          <div className="w-full lg:col-span-5 flex justify-center lg:justify-start">
            <FlowReveal direction="up" distance={45} duration={0.9} className="w-full max-w-[515px]">
              <div className="relative w-full aspect-[515/560] max-h-[560px] rounded-2xl overflow-hidden bg-[#e2ddd3]/30 border border-[#e2ddd3] shadow-xl group">
                <Image
                  src={image}
                  alt="Đông Hòa Design - Liên hệ tư vấn & báo giá"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 515px"
                  className="object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl pointer-events-none" />
              </div>
            </FlowReveal>
          </div>

          {/* RIGHT SIDE: Section Header & Contact Form */}
          <div className="w-full lg:col-span-7 flex flex-col justify-center">
            {/* Header Area */}
            <FlowReveal direction="up" distance={30} delay={0.1} className="mb-6 sm:mb-8">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-5 h-[1.5px] bg-[#c5a26c]" />
                <span className="text-[12px] sm:text-[13px] font-semibold text-[#6e706a] uppercase tracking-widest font-accent">
                  {tag}
                </span>
              </div>

              <h2 className="text-[28px] sm:text-[34px] lg:text-[38px] xl:text-[42px] font-semibold text-[#2d302e] font-display uppercase leading-[1.18] tracking-tight mb-3 whitespace-pre-line">
                {heading}
              </h2>

              <p className="text-[14px] sm:text-[15.5px] text-[#5f6361] italic leading-relaxed max-w-[600px]">
                &ldquo;{quote}&rdquo;
              </p>
            </FlowReveal>

            {/* FORM CONTAINER WITH SCROLL-IN (PULL UP/DOWN) AND SWIPE GESTURES */}
            <motion.div
              initial={{ opacity: 0, y: 45, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-[500px] mx-auto lg:mx-0"
            >
              <AnimatePresence mode="wait">
                {isDismissed ? (
                  /* RESTORE BAR: MINIMALIST VIETNAMESE "→ TƯ VẤN" (ARROW + INQUIRE) */
                  <motion.div
                    key="restore-tab"
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={{ left: 0.1, right: 0.6 }}
                    onDragEnd={(_, info) => {
                      if (info.offset.x > 30 || info.velocity.x > 120) {
                        setIsDismissed(false);
                      }
                    }}
                    onClick={() => setIsDismissed(false)}
                    role="button"
                    tabIndex={0}
                    style={{ touchAction: 'pan-y' }}
                    className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-[#04092b] text-white shadow-md hover:bg-[#c5a26c] transition-all duration-300 cursor-pointer select-none group touch-manipulation"
                    aria-label="Tư vấn"
                  >
                    <ArrowRight className="w-4 h-4 text-[#c5a26c] group-hover:text-white transition-all group-hover:translate-x-1 group-active:translate-x-1 shrink-0" />
                    <span className="text-[12px] sm:text-[13px] font-bold uppercase tracking-widest text-white group-hover:text-white transition-colors">
                      Tư vấn
                    </span>
                  </motion.div>
                ) : submitted ? (
                  /* SUBMITTED SUCCESS CARD */
                  <motion.div
                    key="submitted-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full p-6 sm:p-8 bg-white border border-[#e2ddd3] rounded-lg shadow-sm space-y-4 text-center"
                  >
                    <CheckCircle2 className="w-12 h-12 text-[#c5a26c] mx-auto" />
                    <h3 className="text-[18px] sm:text-[20px] font-semibold text-[#2d302e] font-display uppercase">
                      Gửi yêu cầu thành công!
                    </h3>
                    <p className="text-[13.5px] text-[#5f6361] font-light leading-relaxed">
                      Thông tin đã được gửi trực tiếp đến hộp thư Kiến trúc sư (<strong className="font-semibold text-[#2d302e]">nhatdong1511@gmail.com</strong>). Đội ngũ Đông Hòa Design sẽ liên hệ tư vấn và gửi báo giá chi tiết trong vòng 15 phút.
                    </p>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="mt-2 text-[12px] uppercase tracking-wider font-semibold text-[#2d302e] hover:text-[#c5a26c] underline transition-colors"
                    >
                      Gửi yêu cầu khác
                    </button>
                  </motion.div>
                ) : (
                  /* ACTIVE FORM CARD (SWIPE LEFT TO DISAPPEAR) */
                  <motion.div
                    key="active-form-card"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -300 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={{ left: 0.55, right: 0.05 }}
                    onDragEnd={(_, info) => {
                      if (info.offset.x < -60 || info.velocity.x < -200) {
                        setIsDismissed(true);
                      }
                    }}
                    style={{ touchAction: 'pan-y' }}
                    className="w-full bg-transparent"
                  >
                    {/* Error Banner */}
                    {errorMessage && (
                      <div className="mb-3.5 p-3 bg-red-50 border border-red-200 rounded text-[12.5px] text-red-700 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="w-full">
                      <FlowStaggerGroup staggerDelay={0.06} className="space-y-4 sm:space-y-4.5">
                        {/* Field 1: Họ và tên */}
                        <FlowItem distance={20} className="space-y-1">
                          <label className="block text-[12px] font-light tracking-wide text-[#2d302e] font-sans">
                            Họ và tên: <span className="text-[#a70c0c]">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Nhập họ và tên"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            onPointerDownCapture={(e) => e.stopPropagation()}
                            onTouchStartCapture={(e) => e.stopPropagation()}
                            className="w-full h-[40px] px-3.5 bg-white border border-[#e2ddd3] rounded text-[13px] text-[#2d302e] placeholder:text-[#5f6361]/60 placeholder:text-[12.5px] placeholder:font-light focus:outline-none focus:border-[#2d302e] focus:ring-1 focus:ring-[#2d302e] transition-all"
                          />
                        </FlowItem>

                        {/* Field 2: Số điện thoại */}
                        <FlowItem distance={20} className="space-y-1">
                          <label className="block text-[12px] font-light tracking-wide text-[#2d302e] font-sans">
                            Số điện thoại: <span className="text-[#a70c0c]">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="090x xxx xxx"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            onPointerDownCapture={(e) => e.stopPropagation()}
                            onTouchStartCapture={(e) => e.stopPropagation()}
                            className="w-full h-[40px] px-3.5 bg-white border border-[#e2ddd3] rounded text-[13px] text-[#2d302e] placeholder:text-[#5f6361]/60 placeholder:text-[12.5px] placeholder:font-light focus:outline-none focus:border-[#2d302e] focus:ring-1 focus:ring-[#2d302e] transition-all"
                          />
                        </FlowItem>

                        {/* Field 3: Loại hình nhà */}
                        <FlowItem distance={20} className="space-y-1">
                          <label className="block text-[12px] font-light tracking-wide text-[#2d302e] font-sans">
                            Loại hình nhà:
                          </label>
                          <input
                            type="text"
                            placeholder="Căn hộ / Nhà phố / Biệt thự / Khác"
                            value={formData.propertyType}
                            onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                            onPointerDownCapture={(e) => e.stopPropagation()}
                            onTouchStartCapture={(e) => e.stopPropagation()}
                            className="w-full h-[40px] px-3.5 bg-white border border-[#e2ddd3] rounded text-[13px] text-[#2d302e] placeholder:text-[#5f6361]/60 placeholder:text-[12.5px] placeholder:font-light focus:outline-none focus:border-[#2d302e] focus:ring-1 focus:ring-[#2d302e] transition-all"
                          />
                        </FlowItem>

                        {/* Field 4: Diện tích */}
                        <FlowItem distance={20} className="space-y-1">
                          <label className="block text-[12px] font-light tracking-wide text-[#2d302e] font-sans">
                            Diện tích (m2):
                          </label>
                          <input
                            type="text"
                            placeholder="VD: 85m2, 120m2..."
                            value={formData.area}
                            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                            onPointerDownCapture={(e) => e.stopPropagation()}
                            onTouchStartCapture={(e) => e.stopPropagation()}
                            className="w-full h-[40px] px-3.5 bg-white border border-[#e2ddd3] rounded text-[13px] text-[#2d302e] placeholder:text-[#5f6361]/60 placeholder:text-[12.5px] placeholder:font-light focus:outline-none focus:border-[#2d302e] focus:ring-1 focus:ring-[#2d302e] transition-all"
                          />
                        </FlowItem>

                        {/* Field 5: Nhu cầu */}
                        <FlowItem distance={20} className="space-y-1">
                          <label className="block text-[12px] font-light tracking-wide text-[#2d302e] font-sans">
                            Nhu cầu:
                          </label>
                          <input
                            type="text"
                            placeholder="Thiết kế / Thi công trọn gói / Sản xuất nội thất"
                            value={formData.need}
                            onChange={(e) => setFormData({ ...formData, need: e.target.value })}
                            onPointerDownCapture={(e) => e.stopPropagation()}
                            onTouchStartCapture={(e) => e.stopPropagation()}
                            className="w-full h-[40px] px-3.5 bg-white border border-[#e2ddd3] rounded text-[13px] text-[#2d302e] placeholder:text-[#5f6361]/60 placeholder:text-[12.5px] placeholder:font-light focus:outline-none focus:border-[#2d302e] focus:ring-1 focus:ring-[#2d302e] transition-all"
                          />
                        </FlowItem>

                        {/* Submit Button */}
                        <FlowItem distance={20} className="pt-2">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-auto px-7 h-[42px] bg-[#04092b] hover:bg-[#c5a26c] text-white hover:text-[#04092b] text-[12px] font-semibold uppercase tracking-wider rounded transition-all duration-300 flex items-center justify-center gap-2 group shadow-sm disabled:opacity-70 transform hover:-translate-y-0.5 active:translate-y-0"
                          >
                            {isSubmitting ? (
                              <span>Đang gửi thông tin...</span>
                            ) : (
                              <>
                                <span>GỬI YÊU CẦU</span>
                                <Send className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                              </>
                            )}
                          </button>
                        </FlowItem>
                      </FlowStaggerGroup>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
