
import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  bgColor: string;
}

export const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  imageSrc, 
  imageAlt,
  bgColor 
}: FeatureCardProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden flex flex-col h-full">
      {/* Feature Image/Screenshot */}
      <div className="w-full h-48 relative overflow-hidden">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      
      {/* Feature Content */}
      <div className="p-5 sm:p-6 flex-grow">
        <div className={`p-2 sm:p-3 ${bgColor} rounded-lg w-fit mb-3 sm:mb-4 flex items-center justify-center`}>
          {icon}
        </div>
        <h3 className="text-lg sm:text-xl font-semibold mb-2">{title}</h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          {description}
        </p>
      </div>
      
      {/* Learn More Link */}
      <div className="px-5 sm:px-6 pb-5 sm:pb-6 mt-auto">
        <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium flex items-center gap-1 group">
          Learn more
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transform transition-transform group-hover:translate-x-1"
          >
            <path
              d="M8.33333 5.83333L12.5 10L8.33333 14.1667"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
