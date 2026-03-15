import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ContentRowProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onViewAll?: () => void;
}

export const ContentRow: React.FC<ContentRowProps> = ({ title, icon, children, onViewAll }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <section className="space-y-6 group/row relative">
      <div className="flex items-center justify-between px-6 sm:px-12">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tighter flex items-center gap-3">
          {title} {icon}
        </h2>
        {onViewAll && (
          <button 
            onClick={onViewAll}
            className="text-sm font-bold text-primary hover:underline uppercase tracking-widest"
          >
            View All
          </button>
        )}
      </div>

      <div className="relative group">
        {/* Scroll Buttons */}
        <button 
          onClick={() => scroll("left")}
          className="absolute left-0 top-0 bottom-0 w-12 sm:w-16 bg-gradient-to-r from-black/80 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white hover:text-primary"
        >
          <ChevronLeft size={40} />
        </button>

        <div 
          ref={rowRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide px-6 sm:px-12 pb-4"
        >
          {children}
        </div>

        <button 
          onClick={() => scroll("right")}
          className="absolute right-0 top-0 bottom-0 w-12 sm:w-16 bg-gradient-to-l from-black/80 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white hover:text-primary"
        >
          <ChevronRight size={40} />
        </button>
      </div>
    </section>
  );
};
