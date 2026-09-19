'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ProjectsBlock, ProjectItem } from '@/lib/types';
import { ArrowRight, Check } from 'lucide-react';

interface ProjectsSectionProps {
  block: ProjectsBlock;
  onSelectProject?: (project: ProjectItem) => void;
}

export default function ProjectsSection({ block }: ProjectsSectionProps) {
  const items = block.items || [];
  const [activeItem, setActiveItem] = useState<ProjectItem>(items[0] || null);

  return (
    <section id="styles" className="w-full py-20 lg:py-28 px-4 sm:px-8 lg:px-20 bg-white">
      <div className="max-w-[1280px] mx-auto space-y-14">
        {/* Section Header from Figma */}
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-[1.5px] bg-[#c5a26c]" />
            <span className="text-[12px] font-semibold text-[#a70c0c] uppercase tracking-widest font-accent">
              {block.badge || 'CÁC SẢN PHẨM ĐẶC BIỆT'}
            </span>
          </div>
          <h2 className="text-[32px] sm:text-[42px] font-medium text-[#04092b] font-display">
            {block.title || 'PHONG CÁCH THIẾT KẾ NỘI THẤT'}
          </h2>
          <p className="text-[15px] sm:text-[16px] text-[#6e706a] leading-relaxed font-light">
            Dù theo đuổi nét tối giản hiện đại hay vẻ đẹp sang trọng cổ điển, không gian sống luôn cần phản ánh đúng thần thái của người sở hữu. Đó chính là chìa khóa tạo nên sự khác biệt và giá trị bền vững cho mỗi công trình.
          </p>
        </div>

        {/* 4 Styles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.slice(0, 4).map((item, idx) => {
            const isSelected = activeItem?.id === item.id;
            return (
              <motion.div
                key={item.id || idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                onClick={() => setActiveItem(item)}
                className={`cursor-pointer border transition-all duration-300 p-6 flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'border-[#04092b] bg-[#f4f1ea] shadow-lg ring-1 ring-[#04092b]'
                    : 'border-[#e2ddd3] bg-white hover:border-[#c5a26c] hover:shadow-md'
                }`}
              >
                <div className="space-y-3">
                  <div className="relative w-full h-[180px] overflow-hidden bg-[#04092b]">
                    <Image
                      src={item.image || '/uploads/figma_modern_minimalist.png'}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>

                  <h3 className="text-[18px] font-bold text-[#04092b] font-display">
                    {item.name}
                  </h3>

                  <p className="text-[13px] text-[#6e706a] font-light leading-relaxed line-clamp-4">
                    {item.location} {item.propertyTypes}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#e2ddd3] flex items-center justify-between text-[12px] font-semibold uppercase tracking-wider text-[#04092b]">
                  <span>Chi tiết phong cách</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Highlighted Showcase Banner for Selected Style */}
        {activeItem && (
          <motion.div
            key={activeItem.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[#04092b] text-white p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-2 border-[#c5a26c]"
          >
            <div className="lg:col-span-6 space-y-4">
              <span className="inline-block text-[11px] font-semibold uppercase tracking-widest text-[#c5a26c] bg-white/10 px-3 py-1">
                {activeItem.area || 'Phong cách thiết kế'}
              </span>
              <h3 className="text-[26px] sm:text-[34px] font-medium font-display leading-tight">
                {activeItem.name}
              </h3>
              <p className="text-[14px] sm:text-[15px] text-white/90 leading-relaxed font-light">
                {activeItem.location}
              </p>
              <p className="text-[13.5px] text-[#c5a26c] font-light leading-relaxed">
                Đặc trưng vật liệu & Màu sắc: {activeItem.propertyTypes}
              </p>
              <div className="pt-2">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 bg-[#c5a26c] hover:bg-white text-[#04092b] px-6 py-2.5 text-[12.5px] font-semibold uppercase tracking-wider transition-colors"
                >
                  <span>Nhận tư vấn phong cách này</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-6 relative h-[260px] sm:h-[340px] overflow-hidden border border-white/20">
              <Image
                src={activeItem.image || '/uploads/figma_modern_minimalist.png'}
                alt={activeItem.name}
                fill
                className="object-cover"
              />
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
