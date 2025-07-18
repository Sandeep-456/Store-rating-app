import React, { useState } from 'react';
import './index.css';

const StarRating = ({ rating = 0, onRate = null }) => {
  const [hoverIndex, setHoverIndex] = useState(null);
  const filledStars = Math.round(rating);

  return (
    <div className="star-rating">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className={`star ${
            hoverIndex !== null
              ? i <= hoverIndex
                ? 'hovered'
                : ''
              : i < filledStars
              ? 'filled'
              : ''
          } ${onRate ? 'clickable' : ''}`}
          onClick={() => onRate && onRate(i + 1)}
          onMouseEnter={() => onRate && setHoverIndex(i)}
          onMouseLeave={() => setHoverIndex(null)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;
