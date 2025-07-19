import React, { useState, useEffect } from 'react';
import CardActionButtons from './CardActionButtons';

export default function FavoritesList({ allRecipes }) {
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);

  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const filtered = allRecipes.filter(recipe => storedFavorites.includes(recipe.id));
    
    setFavoriteRecipes(filtered);
  }, [allRecipes]);

  if (favoriteRecipes.length === 0) {
    return <p>You haven't favorited any recipes yet. Click the heart icon on a recipe to add it here!</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {favoriteRecipes.map((recipe) => (
          <a key={recipe.id} href={`/recipes/${recipe.id}/`} className="card group relative">
              <CardActionButtons recipeId={recipe.id} />
              <img src={recipe.thumbnail} alt={`Image of ${recipe.title}`} className="card-image" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/default.jpg'; }} />
              <div className="card-body">
                  <h2>{recipe.title}</h2>
                  <p className="text-slate-600 mt-2">{recipe.description}</p>
              </div>
          </a>
      ))}
  </div>
  );
}