import React, { useState, useEffect } from 'react';
import { formatTime } from '../../utils/formatters.js';

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
    if (isActive) {
      const checkedItems = JSON.parse(localStorage.getItem('shopping_list_checked') || '[]');
      const newCheckedItems = checkedItems.filter(key => !key.startsWith(recipe.id));
      localStorage.setItem('shopping_list_checked', JSON.stringify(newCheckedItems));
    }
    updateStorage('active_recipes', recipe.id);
    setIsActive(!isActive);
    window.dispatchEvent(new Event('storageupdate'));
  };

  const handleError = () => {
    setHasError(true);
  };

  const totalTime = (recipe.time.prep || 0) + (recipe.time.cook || 0) + (recipe.time.rest || 0);
  const servings = recipe.servings || 0;
  const cookwareCount = recipe.cookware?.length || 0;

  return (
    <a href={`/cookbook/${recipe.id}/`} className="card group">
      <div className="relative overflow-hidden">
        <img
          src={hasError ? '/images/default.jpg' : recipe.thumbnail}
          alt={`Image of ${recipe.title}`}
          className="card-image"
          onError={handleError}
        />
        
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

        <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white text-sm backdrop-blur-sm transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
            <div className="flex justify-around items-center">
                <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                    <span>{formatTime(totalTime)}</span>
                </div>
                <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-4.688c.621.452 1.227 1.053 1.79 1.766Z" /></svg>
                    <span>{servings} Servings</span>
                </div>
                <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4" /></svg>
                    <span>{cookwareCount} Items</span>
                </div>
            </div>
        </div>
      </div>
      
      <div className="card-body">
        <h2>{recipe.title}</h2>
        <p className="text-muted mt-2 text-sm">{recipe.description}</p>
      </div>
    </a>
  );
}