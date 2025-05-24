
import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  editable?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  onRatingChange, 
  editable = false 
}) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  
  const handleClick = (selectedRating: number) => {
    if (editable && onRatingChange) {
      onRatingChange(selectedRating);
    }
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((starValue) => (
        <div 
          key={starValue}
          className={editable ? 'cursor-pointer' : ''}
          onClick={() => handleClick(starValue)}
        >
          {starValue <= fullStars ? (
            <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
          ) : starValue === fullStars + 1 && hasHalfStar ? (
            <StarHalf className="w-6 h-6 fill-yellow-400 text-yellow-400" />
          ) : (
            <Star className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
      ))}
    </div>
  );
};
