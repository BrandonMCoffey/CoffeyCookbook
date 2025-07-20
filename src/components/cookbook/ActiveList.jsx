import React, { useState, useEffect, useCallback  } from 'react';
import RandomRecipes from './RandomRecipes';
import RecipeCard from './RecipeCard';

export default function ActiveList({ allRecipes }) {
  const [activeRecipes, setActiveRecipes] = useState([]);

  const updateActiveRecipes = useCallback(() => {
    const storedActive = JSON.parse(localStorage.getItem('active_recipes') || '[]');
    const filtered = allRecipes.filter(recipe => storedActive.includes(recipe.id));
    setActiveRecipes(filtered);
  }, [allRecipes]);

  useEffect(() => {
    updateActiveRecipes();

    window.addEventListener('storageupdate', updateActiveRecipes);

    return () => {
      window.removeEventListener('storageupdate', updateActiveRecipes);
    };
  }, [updateActiveRecipes]);

  if (activeRecipes.length > 0) {
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

  return (
    <div>
      <h1 class="text-4xl font-bold mb-8">Recipe Suggestions</h1>
      <RandomRecipes allRecipes={allRecipes} count={3} />
    </div>
  )
}