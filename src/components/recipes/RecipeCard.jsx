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

export default function RecipeCard({ recipe }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsFavorited(getFromStorage('favorites').includes(recipe.id));
    setIsActive(getFromStorage('active_recipes').includes(recipe.id));
  }, [recipe.id]);
  
  useEffect(() => {
    setHasError(false);
  }, [recipe.thumbnail]);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    updateStorage('favorites', recipe.id);
    setIsFavorited(!isFavorited);
    window.dispatchEvent(new Event('storageupdate'));
  };

  const handleActiveClick = (e) => {
    e.preventDefault();
    updateStorage('active_recipes', recipe.id);
    setIsActive(!isActive);
    window.dispatchEvent(new Event('storageupdate'));
  };

  const handleError = () => {
    setHasError(true);
  };

  return (
    <a href={`/recipes/${recipe.id}/`} className="card group relative">
        <div className="card-actions">
            <button
                onClick={handleActiveClick}
                title={isActive ? 'Remove from Active List' : 'Add to Active List'}
                className={`card-btn ${isActive ? 'active-plus' : 'inactive'}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </button>
            <button
                onClick={handleFavoriteClick}
                title={isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
                className={`card-btn ${isFavorited ? 'active-heart' : 'inactive'}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill={isFavorited ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
            </button>
        </div>
        
        <img
            src={hasError ? '/images/default.jpg' : recipe.thumbnail}
            alt={`Image of ${recipe.title}`}
            className="card-image"
            onError={handleError}
        />
        
        <div className="card-body">
            <h2>{recipe.title}</h2>
            <p className="text-muted mt-2">{recipe.description}</p>
        </div>
    </a>
  );
}