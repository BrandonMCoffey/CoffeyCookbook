import React, { useState, useMemo } from 'react';

const TIME_RANGES = [
  { label: 'Any Time', maxMinutes: Infinity },
  { label: '< 15 min', maxMinutes: 15 },
  { label: '15-30 min', minMinutes: 15, maxMinutes: 30 },
  { label: '30-45 min', minMinutes: 30, maxMinutes: 45 },
  { label: '45m - 1hr', minMinutes: 45, maxMinutes: 60 },
  { label: '1-2 hr', minMinutes: 60, maxMinutes: 120 },
  { label: '2-4 hr', minMinutes: 120, maxMinutes: 240 },
  { label: '4+ hr', minMinutes: 240, maxMinutes: Infinity },
];

const COOKWARE_RANGES = [
  { label: 'Any Amount', max: Infinity },
  { label: '1-2 Items', max: 2 },
  { label: '3-4 Items', max: 4 },
  { label: '5+ Items', min: 5, max: Infinity },
];

export default function RecipeFilter({ allRecipes, categories, cuisines, diets }) {
  const [activeCategories, setActiveCategories] = useState(new Set());
  const [activeCuisines, setActiveCuisines] = useState(new Set());
  const [activeDiets, setActiveDiets] = useState(new Set());
  const [timeFilter, setTimeFilter] = useState(TIME_RANGES[0]);
  const [cookwareFilter, setCookwareFilter] = useState(COOKWARE_RANGES[0]);

  const handleTagToggle = (stateSet, setter, item) => {
    const newSet = new Set(stateSet);
    if (newSet.has(item)) {
      newSet.delete(item);
    } else {
      newSet.add(item);
    }
    setter(newSet);
  };

  const clearAllFilters = () => {
    setActiveCategories(new Set());
    setActiveCuisines(new Set());
    setActiveDiets(new Set());
    setTimeFilter(TIME_RANGES[0]);
    setCookwareFilter(COOKWARE_RANGES[0]);
  };

  const filteredRecipes = useMemo(() => {
    return allRecipes
      .filter(recipe => {
        if (activeCategories.size === 0) return true;
        return activeCategories.has(recipe.category);
      })
      .filter(recipe => {
        if (activeCuisines.size === 0) return true;
        return recipe.cuisines?.some(c => activeCuisines.has(c));
      })
      .filter(recipe => {
        if (activeDiets.size === 0) return true;
        return recipe.diets?.some(d => activeDiets.has(d));
      })
      .filter(recipe => {
        if (timeFilter.maxMinutes === Infinity && !timeFilter.minMinutes) return true;
        const totalTime = (recipe.time.prep || 0) + (recipe.time.cook || 0) + (recipe.time.rest || 0);
        const min = timeFilter.minMinutes || 0;
        const max = timeFilter.maxMinutes || Infinity;
        return totalTime > min && totalTime <= max;
      })
      .filter(recipe => {
        if (cookwareFilter.max === Infinity && !cookwareFilter.min) return true;
        const count = recipe.cookware?.length || 0;
        const min = cookwareFilter.min || 0;
        const max = cookwareFilter.max || Infinity;
        return count >= min && count <= max;
      });
  }, [allRecipes, activeCategories, activeCuisines, activeDiets, timeFilter, cookwareFilter]);

  return (
    <div>
      <div className="space-y-4 mb-12 p-4 border rounded-lg bg-white">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Filters</h2>
            <button onClick={clearAllFilters} className="text-sm text-blue-600 hover:underline">
                Clear All
            </button>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Category</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map(({ name, count }) => (
              <button key={name} onClick={() => handleTagToggle(activeCategories, setActiveCategories, name)} className={`sort-btn ${activeCategories.has(name) ? 'active' : ''}`}>
                {name} <span className="ml-1.5 opacity-75">({count})</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Cuisine</h3>
          <div className="flex flex-wrap gap-2">
            {cuisines.map(({ name, count }) => (
               <button key={name} onClick={() => handleTagToggle(activeCuisines, setActiveCuisines, name)} className={`sort-btn ${activeCuisines.has(name) ? 'active' : ''}`}>
                {name} <span className="ml-1.5 opacity-75">({count})</span>
              </button>
            ))}
          </div>
        </div>
         <div>
          <h3 className="font-semibold mb-2">Diet</h3>
          <div className="flex flex-wrap gap-2">
            {diets.map(({ name, count }) => (
              <button key={name} onClick={() => handleTagToggle(activeDiets, setActiveDiets, name)} className={`sort-btn ${activeDiets.has(name) ? 'active' : ''}`}>
                {name} <span className="ml-1.5 opacity-75">({count})</span>
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <h3 className="font-semibold mb-2">Max Time</h3>
            <div className="flex flex-wrap gap-2">
              {TIME_RANGES.map(range => (
                <button key={range.label} onClick={() => setTimeFilter(range)} className={`sort-btn ${timeFilter.label === range.label ? 'active' : ''}`}>
                  {range.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Cookware Items</h3>
            <div className="flex flex-wrap gap-2">
              {COOKWARE_RANGES.map(range => (
                <button key={range.label} onClick={() => setCookwareFilter(range)} className={`sort-btn ${cookwareFilter.label === range.label ? 'active' : ''}`}>
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-lg font-semibold">{filteredRecipes.length} Recipes Found</p>
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