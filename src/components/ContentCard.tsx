import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Star, Play } from "lucide-react";

interface ContentCardProps {
  id: string;
  title: string;
  image: string;
  type: "anime" | "donghua" | "kdrama";
  rating?: number;
  episode?: number | string;
  subTitle?: string;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  id,
  title,
  image,
  type,
  rating,
  episode,
  subTitle
}) => {
  const link = type === "kdrama" ? `/kdrama/${id}` : `/anime/${id}`;

  return (
    <motion.div 
      whileHover={{ scale: 1.05, y: -5 }} 
      className="group relative flex-shrink-0 w-40 sm:w-48 md:w-56"
    >
      <Link to={link}>
        <div className="aspect-[2/3] rounded-xl overflow-hidden bg-white/5 border border-white/10 relative shadow-xl">
          <img 
            src={image} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
            alt={title} 
            loading="lazy"
          />
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-black shadow-lg scale-75 group-hover:scale-100 transition-transform duration-300">
              <Play size={24} fill="currentColor" />
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {rating && (
              <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black border border-white/10 flex items-center gap-1 text-yellow-500">
                <Star size={10} fill="currentColor" />
                {rating.toFixed(1)}
              </div>
            )}
          </div>

          {episode && (
            <div className="absolute bottom-2 right-2 bg-primary px-2 py-1 rounded-lg text-[10px] font-black text-black shadow-lg">
              EP {episode}
            </div>
          )}
        </div>
        
        <div className="mt-3 space-y-1">
          <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-white/40 text-[10px] uppercase tracking-widest font-medium">
            {subTitle || (type === "kdrama" ? "Korean Drama" : type === "donghua" ? "Donghua" : "Anime")}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};
