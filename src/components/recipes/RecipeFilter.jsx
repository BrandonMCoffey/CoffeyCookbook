import React, { useState, useEffect, useMemo } from 'react';

const slugify = (str) => str.toLowerCase().replace(/ /g, '-');

function FilterButton({ tag, count, activeFilter, setFilter }) {
  const tagSlug = slugify(tag);
  const isActive = activeFilter === tagSlug;
  
  const handleClick = () => {
    if (isActive) {
      setFilter('All');
      window.location.hash = '';
    } else {
      setFilter(tagSlug);
      window.location.hash = tagSlug;
    }
  };

  return (
    <button onClick={handleClick} className={`sort-btn ${isActive ? 'active' : ''}`}>
      {tag} <span className="ml-1.5 opacity-75">({count})</span>
    </button>
  );
}

export default function RecipeFilter({ allRecipes, categories, cuisines }) {
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    const getFilterFromHash = () => window.location.hash.substring(1) || 'All';
    
    setActiveFilter(getFilterFromHash());

    const handleHashChange = () => setActiveFilter(getFilterFromHash());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const filteredRecipes = useMemo(() => {
    if (activeFilter === 'All') return allRecipes;
    return allRecipes.filter(recipe => {
      const categoryMatch = slugify(recipe.category) === activeFilter;
      const cuisineMatch = recipe.cuisines.some(c => slugify(c) === activeFilter);
      return categoryMatch || cuisineMatch;
    });
  }, [allRecipes, activeFilter]);

  return (
    <div>
      <div className="space-y-4 mb-12 p-4 border rounded-lg bg-white">
        <div>
          <h3 className="font-semibold mb-2">Category</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map(({ name, count }) => (
              <FilterButton key={name} tag={name} count={count} activeFilter={activeFilter} setFilter={setActiveFilter} />
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Cuisine</h3>
          <div className="flex flex-wrap gap-2">
            {cuisines.map(({ name, count }) => (
              <FilterButton key={name} tag={name} count={count} activeFilter={activeFilter} setFilter={setActiveFilter} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredRecipes.map((recipe) => (
          <a key={recipe.id} href={`/recipes/${recipe.id}/`} className="card">
            <img src={recipe.thumbnail} alt={`Image of ${recipe.title}`} className="card-image" />
            <div className="card-body">
              <h2>{recipe.title}</h2>
              <p className="text-slate-600 mt-2">{recipe.description}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}