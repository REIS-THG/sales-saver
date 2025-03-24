
import { Star } from "lucide-react";

interface TestimonialCardProps {
  quote: string;
  author: string;
  position: string;
  rating: number;
}

export const TestimonialCard = ({ quote, author, position, rating }: TestimonialCardProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex flex-col">
      {/* Star Rating */}
      <div className="flex mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${
              i < rating ? "text-amber-500 fill-amber-500" : "text-gray-300"
            }`}
          />
        ))}
      </div>
      
      {/* Quote */}
      <blockquote className="text-gray-700 dark:text-gray-200 mb-4 flex-grow">
        "{quote}"
      </blockquote>
      
      {/* Author */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <p className="font-semibold">{author}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{position}</p>
      </div>
    </div>
  );
};
