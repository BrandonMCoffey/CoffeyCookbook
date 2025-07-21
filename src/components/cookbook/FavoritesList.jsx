import React, { useState, useEffect, useMemo } from 'react';
import RandomRecipes from './RandomRecipes';
import RecipeCard from './RecipeCard';

export default function FavoritesList({ allRecipes }) {
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);

  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const filtered = allRecipes.filter(recipe => storedFavorites.includes(recipe.id));
    
    setFavoriteRecipes(filtered);
  }, [allRecipes]);

  if (favoriteRecipes.length === 0) {
    return (
      <div>
        <h1 class="text-4xl font-bold mb-8">Your Favorites</h1>
        <p>You haven't favorited any recipes yet. Click the heart icon on a recipe to add it here!</p>
        <hr class="mt-16 pt-16"/>
        <div>
          <h1 class="text-4xl font-bold mb-8">You Also Might Like</h1>
          <br></br>
          <RandomRecipes allRecipes={allRecipes} count={3} />
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
    <hr class="mt-16 pt-16"/>
    <div>
      <h1 class="text-4xl font-bold mb-8">You Also Might Like</h1>
      <br></br>
      <RandomRecipes allRecipes={allRecipes} count={3} />
    </div>
  </div>
  );
}