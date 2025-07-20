import React, { useState, useEffect, useMemo } from 'react';
import RecipeCard from './RecipeCard';

const MAX_RANDOM_SUGGESTIONS = 3;

export default function FavoritesList({ allRecipes }) {
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);

  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const filtered = allRecipes.filter(recipe => storedFavorites.includes(recipe.id));
    
    setFavoriteRecipes(filtered);
  }, [allRecipes]);

  const randomRecipes = useMemo(() => {
    if (favoriteRecipes.length > 0) return [];
    
    return [...allRecipes]
      .sort(() => 0.5 - Math.random())
      .slice(0, MAX_RANDOM_SUGGESTIONS);
  }, [allRecipes, favoriteRecipes]);

  if (favoriteRecipes.length === 0) {
    return (
      <div>
        <h1 class="text-4xl font-bold mb-8">Your Favorites</h1>
        <p>You haven't favorited any recipes yet. Click the heart icon on a recipe to add it here!</p>
        <br></br>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {randomRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
        </div>
      </div>
    )
  }

  return (
    <div>
    <h1 class="text-4xl font-bold mb-8">Your Favorites</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {favoriteRecipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  </div>
  );
}