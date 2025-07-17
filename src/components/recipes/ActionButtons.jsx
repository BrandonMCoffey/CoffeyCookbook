import React, { useState, useEffect } from 'react';

const getFromStorage = (key) => {
  if (typeof window === 'undefined') return [];
  const storedValue = localStorage.getItem(key);
  return storedValue ? JSON.parse(storedValue) : [];
};

const updateStorage = (key, id) => {
  const items = getFromStorage(key);
  const newItems = items.includes(id)
    ? items.filter(itemId => itemId !== id)
    : [...items, id];
  localStorage.setItem(key, JSON.stringify(newItems));
  return newItems;
};


export default function ActionButtons({ recipeId }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsFavorited(getFromStorage('favorites').includes(recipeId));
    setIsActive(getFromStorage('active_recipes').includes(recipeId));
  }, [recipeId]);

  const handleFavoriteClick = () => {
    updateStorage('favorites', recipeId);
    setIsFavorited(!isFavorited);
  };

  const handleActiveClick = () => {
    updateStorage('active_recipes', recipeId);
    setIsActive(!isActive);
  };

  return (
    <div className="flex items-center space-x-4 my-6">
      <button
        onClick={handleFavoriteClick}
        className={`btn btn-secondary ${isFavorited ? 'btn-favorite active' : ''}`}
      >
        {isFavorited ? '❤️ Favorited' : '🤍 Favorite'}
      </button>
      <button
        onClick={handleActiveClick}
        className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
      >
        {isActive ? '✅ Added to List' : '🛒 Add to Active List'}
      </button>
    </div>
  );
}