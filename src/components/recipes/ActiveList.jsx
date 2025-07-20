import React, { useState, useEffect } from 'react';
import RandomRecipes from './RandomRecipes';
import RecipeCard from './RecipeCard';

export default function ActiveList({ allRecipes }) {
  const [activeRecipes, setActiveRecipes] = useState([]);

  useEffect(() => {
    const storedActive = JSON.parse(localStorage.getItem('active_recipes') || '[]');
    const filtered = allRecipes.filter(recipe => storedActive.includes(recipe.id));

    setActiveRecipes(filtered);
  }, [allRecipes]);

  if (activeRecipes.length === 0) {
    return (
      <div>
        <RandomRecipes allRecipes={allRecipes} count={3} />
      </div>
    )
  }

  return (
    <div>
      <h1 class="text-4xl font-bold mb-8">Your Active Recipes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {activeRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}