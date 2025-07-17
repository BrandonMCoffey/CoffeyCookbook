import React, { useState, useEffect } from 'react';

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
        <a key={recipe.id} href={`/recipes/${recipe.id}/`} className="block border rounded-lg overflow-hidden hover:shadow-xl transition-shadow">
          <img src={recipe.thumbnail} alt={`Image of ${recipe.title}`} className="w-full h-48 object-cover" />
          <div className="p-4">
            <h2 className="text-2xl font-semibold">{recipe.title}</h2>
            <p className="text-gray-600 mt-2">{recipe.description}</p>
          </div>
        </a>
      ))}
    </div>
  );
}