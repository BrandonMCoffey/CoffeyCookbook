import React, { useState, useEffect } from 'react';

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