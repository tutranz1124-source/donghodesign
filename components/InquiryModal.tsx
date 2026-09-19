'use client';

import React, { useState } from 'react';
import { X, Phone, Mail, MapPin, Send, CheckCircle2, MessageSquare } from 'lucide-react';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProject?: string;
}

export default function InquiryModal({ isOpen, onClose, defaultProject }: InquiryModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setName('');
      setPhone('');
      setMessage('');
      onClose();
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#04092b] text-white border border-[#c5a26c] max-w-lg w-full p-8 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {submitted ? (
          <div className="py-12 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-[#c5a26c] mx-auto animate-bounce" />
            <h3 className="text-[24px] font-semibold font-display text-white">
              Đăng Ký Thành Công!
            </h3>
            <p className="text-[14px] text-white/80 max-w-sm mx-auto">
              Chuyên viên tư vấn cao cấp của Đông Hòa Property sẽ liên hệ trực tiếp với quý khách trong ít phút.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <span className="text-[11px] font-semibold text-[#c5a26c] uppercase tracking-widest font-accent">
                KẾT NỐI TRỰC TIẾP
              </span>
              <h3 className="text-[24px] font-medium font-display text-white">
                Tư Vấn Đầu Tư Chuyên Sâu
              </h3>
              <p className="text-[13px] text-white/70">
                Nhận thông tin độc quyền và bảng giá ưu đãi trực tiếp từ chủ đầu tư.
              </p>
            </div>

            {/* Direct Contact Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <a
                href="tel:0909123456"
                className="bg-[#c5a26c] hover:bg-[#b38f57] text-[#04092b] p-3 text-center font-semibold text-[13px] flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4" /> Hotline: 0909 123 456
              </a>
              <a
                href="https://zalo.me"
                target="_blank"
                rel="noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 text-center font-semibold text-[13px] flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4" /> Chat Zalo Ngay
              </a>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-white/20"></div>
              <span className="flex-shrink mx-4 text-white/40 text-[11px] uppercase tracking-wider">hoặc để lại lời nhắn</span>
              <div className="flex-grow border-t border-white/20"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Họ và tên của quý khách *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 px-4 py-3 text-[14px] text-white placeholder-white/50 focus:border-[#c5a26c] focus:outline-none"
                />
              </div>

              <div>
                <input
                  type="tel"
                  required
                  placeholder="Số điện thoại liên hệ *"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 px-4 py-3 text-[14px] text-white placeholder-white/50 focus:border-[#c5a26c] focus:outline-none"
                />
              </div>

              <div>
                <textarea
                  rows={2}
                  placeholder={defaultProject ? `Quan tâm dự án: ${defaultProject}` : "Dự án hoặc nhu cầu quý khách đang quan tâm..."}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 px-4 py-2.5 text-[14px] text-white placeholder-white/50 focus:border-[#c5a26c] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#c5a26c] hover:bg-[#b38f57] text-[#04092b] py-3.5 text-[13px] font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Gửi Yêu Cầu Tư Vấn
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
