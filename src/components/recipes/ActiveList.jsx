import React, { useState, useEffect } from 'react';
import CardActionButtons from './CardActionButtons';

export default function ActiveList({ allRecipes }) {
  const [activeRecipes, setActiveRecipes] = useState([]);

  useEffect(() => {
    const storedActive = JSON.parse(localStorage.getItem('active_recipes') || '[]');
    const filtered = allRecipes.filter(recipe => storedActive.includes(recipe.id));

    setActiveRecipes(filtered);
  }, [allRecipes]);

  if (activeRecipes.length === 0) {
    return <p>You have no active recipes. Add some to build a shopping list!</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {activeRecipes.map((recipe) => (
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