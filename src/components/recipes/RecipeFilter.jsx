import React, { useState, useMemo } from 'react';
import CardActionButtons from './CardActionButtons';

const TIME_RANGES = [
  { label: 'Any Time', maxMinutes: Infinity },
  { label: '< 15 min', maxMinutes: 15 },
  { label: '15-30 min', minMinutes: 15, maxMinutes: 30 },
  { label: '30m - 1hr', minMinutes: 30, maxMinutes: 60 },
  { label: '1-2 hr', minMinutes: 60, maxMinutes: 120 },
  { label: '2-4 hr', minMinutes: 120, maxMinutes: 240 },
  { label: '4+ hr', minMinutes: 240, maxMinutes: Infinity },
];

const COOKWARE_RANGES = [
  { label: 'Any Amount', max: Infinity },
  { label: '1 Items', max: 1 },
  { label: '2-3 Items', min: 2, max: 3 },
  { label: '4+ Items', min: 4, max: Infinity },
];

const MANUAL_CATEGORY_ORDER = [
  "Breakfast", "Appetizer", "Soup", "Main Course", "Side Dish", "Dessert", "Bread", "Sauce", "Condiment",
];

export default function RecipeFilter({ allRecipes, categories, cuisines, diets }) {
  const [activeCategories, setActiveCategories] = useState(new Set());
  const [activeCuisines, setActiveCuisines] = useState(new Set());
  const [activeDiets, setActiveDiets] = useState(new Set());
  const [timeFilter, setTimeFilter] = useState(TIME_RANGES[0]);
  const [cookwareFilter, setCookwareFilter] = useState(COOKWARE_RANGES[0]);

  const handleTagToggle = (stateSet, setter, item) => {
    const newSet = new Set(stateSet);
    if (newSet.has(item)) newSet.delete(item);
    else newSet.add(item);
    setter(newSet);
  };

  const clearAllFilters = () => {
    setActiveCategories(new Set());
    setActiveCuisines(new Set());
    setActiveDiets(new Set());
    setTimeFilter(TIME_RANGES[0]);
    setCookwareFilter(COOKWARE_RANGES[0]);
  };
  
  const manuallySortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      const indexA = MANUAL_CATEGORY_ORDER.indexOf(a.name);
      const indexB = MANUAL_CATEGORY_ORDER.indexOf(b.name);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [categories]);

  const baseFilters = useMemo(() => {
    let filtered = allRecipes;
    if (activeCategories.size > 0) filtered = filtered.filter(r => activeCategories.has(r.category));
    if (activeCuisines.size > 0) filtered = filtered.filter(r => r.cuisines?.some(c => activeCuisines.has(c)));
    if (activeDiets.size > 0) filtered = filtered.filter(r => r.diets?.some(d => activeDiets.has(d)));
    return filtered;
  }, [allRecipes, activeCategories, activeCuisines, activeDiets]);

  const calculateDynamicCounts = (filterType) => {
    return useMemo(() => {
      let filtered = baseFilters;
      if (filterType !== 'time') {
        if (timeFilter.maxMinutes !== Infinity || timeFilter.minMinutes) {
            filtered = filtered.filter(recipe => {
                const totalTime = (recipe.time.prep || 0) + (recipe.time.cook || 0) + (recipe.time.rest || 0);
                const min = timeFilter.minMinutes || 0;
                const max = timeFilter.maxMinutes || Infinity;
                return totalTime > min && totalTime <= max;
            });
        }
      }
       if (filterType !== 'cookware') {
         if (cookwareFilter.max !== Infinity || cookwareFilter.min) {
            filtered = filtered.filter(recipe => {
                const count = recipe.cookware?.length || 0;
                const min = cookwareFilter.min || 0;
                const max = cookwareFilter.max || Infinity;
                return count >= min && count <= max;
            });
         }
      }
      
      const counts = new Map();
      if (filterType === 'category') filtered.forEach(r => counts.set(r.category, (counts.get(r.category) || 0) + 1));
      if (filterType === 'cuisine') filtered.forEach(r => r.cuisines?.forEach(c => counts.set(c, (counts.get(c) || 0) + 1)));
      if (filterType === 'diet') filtered.forEach(r => r.diets?.forEach(d => counts.set(d, (counts.get(d) || 0) + 1)));
      return counts;
    }, [baseFilters, timeFilter, cookwareFilter]);
  };

  const dynamicCategoryCounts = calculateDynamicCounts('category');
  const dynamicCuisineCounts = calculateDynamicCounts('cuisine');
  const dynamicDietCounts = calculateDynamicCounts('diet');

  const filteredRecipes = useMemo(() => {
    let filtered = baseFilters;
    if (timeFilter.maxMinutes !== Infinity || timeFilter.minMinutes) filtered = filtered.filter(recipe => {
        const totalTime = (recipe.time.prep || 0) + (recipe.time.cook || 0) + (recipe.time.rest || 0);
        const min = timeFilter.minMinutes || 0;
        const max = timeFilter.maxMinutes || Infinity;
        return totalTime > min && totalTime <= max;
    });
    if (cookwareFilter.max !== Infinity || cookwareFilter.min) filtered = filtered.filter(recipe => {
        const count = recipe.cookware?.length || 0;
        const min = cookwareFilter.min || 0;
        const max = cookwareFilter.max || Infinity;
        return count >= min && count <= max;
    });
    return filtered;
  }, [baseFilters, timeFilter, cookwareFilter]);

  const getCountForRange = (range, type) => {
    let filtered = baseFilters;
    if (type === 'time') {
      if (cookwareFilter.max !== Infinity || cookwareFilter.min) {
        filtered = filtered.filter(recipe => {
          const count = recipe.cookware?.length || 0;
          const min = cookwareFilter.min || 0;
          const max = cookwareFilter.max || Infinity;
          return count >= min && count <= max;
        });
      }
      return filtered.filter(recipe => {
        const totalTime = (recipe.time.prep || 0) + (recipe.time.cook || 0) + (recipe.time.rest || 0);
        const min = range.minMinutes || 0;
        const max = range.maxMinutes || Infinity;
        return totalTime > min && totalTime <= max;
      }).length;
    } else {
      if (timeFilter.maxMinutes !== Infinity || timeFilter.minMinutes) {
        filtered = filtered.filter(recipe => {
          const totalTime = (recipe.time.prep || 0) + (recipe.time.cook || 0) + (recipe.time.rest || 0);
          const min = timeFilter.minMinutes || 0;
          const max = timeFilter.maxMinutes || Infinity;
          return totalTime > min && totalTime <= max;
        });
      }
      return filtered.filter(recipe => {
        const count = recipe.cookware?.length || 0;
        const min = range.min || 0;
        const max = range.max || Infinity;
        return count >= min && count <= max;
      }).length;
    }
  };

  return (
    <div>
      <h1 class="text-4xl font-bold mb-8">All Recipes</h1>
      <div className="space-y-4 mb-12 p-4 card-static">
        <div className="flex justify-between items-center"><h2 className="text-xl font-bold">Filters</h2><button onClick={clearAllFilters} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Clear All</button></div>
        <div><h3 className="font-semibold mb-2">Category</h3><div className="flex flex-wrap gap-2">{manuallySortedCategories.map(({ name }) => { const count = dynamicCategoryCounts.get(name) || 0; return (<button key={name} onClick={() => handleTagToggle(activeCategories, setActiveCategories, name)} className={`sort-btn ${activeCategories.has(name) ? 'active' : ''}`} disabled={!activeCategories.has(name) && count === 0}>{name} <span className="ml-1.5 opacity-75">({count})</span></button>);})}</div></div>
        <div><h3 className="font-semibold mb-2">Cuisine</h3><div className="flex flex-wrap gap-2">{cuisines.map(({ name }) => { const count = dynamicCuisineCounts.get(name) || 0; return (<button key={name} onClick={() => handleTagToggle(activeCuisines, setActiveCuisines, name)} className={`sort-btn ${activeCuisines.has(name) ? 'active' : ''}`} disabled={!activeCuisines.has(name) && count === 0}>{name} <span className="ml-1.5 opacity-75">({count})</span></button>);})}</div></div> 
        <div><h3 className="font-semibold mb-2">Diet</h3><div className="flex flex-wrap gap-2">{diets.map(({ name }) => { const count = dynamicDietCounts.get(name) || 0; return (<button key={name} onClick={() => handleTagToggle(activeDiets, setActiveDiets, name)} className={`sort-btn ${activeDiets.has(name) ? 'active' : ''}`} disabled={!activeDiets.has(name) && count === 0}>{name} <span className="ml-1.5 opacity-75">({count})</span></button>);})}</div></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div><h3 className="font-semibold mb-2">Max Time</h3><div className="flex flex-wrap gap-2">{TIME_RANGES.map(range => { const count = getCountForRange(range, 'time'); return (<button key={range.label} onClick={() => setTimeFilter(range)} className={`sort-btn ${timeFilter.label === range.label ? 'active' : ''}`} disabled={timeFilter.label !== range.label && count === 0}>{range.label} <span className="ml-1.5 opacity-75">({count})</span></button>)})}</div></div> 
          <div><h3 className="font-semibold mb-2">Cookware Items</h3><div className="flex flex-wrap gap-2">{COOKWARE_RANGES.map(range => { const count = getCountForRange(range, 'cookware'); return (<button key={range.label} onClick={() => setCookwareFilter(range)} className={`sort-btn ${cookwareFilter.label === range.label ? 'active' : ''}`} disabled={cookwareFilter.label !== range.label && count === 0}>{range.label} <span className="ml-1.5 opacity-75">({count})</span></button>)})}</div></div>
        </div>
      </div>
      <div className="mb-4"><p className="text-lg font-semibold">{filteredRecipes.length} Recipes Found</p></div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"> 
        {filteredRecipes.map((recipe) => (
          <a key={recipe.id} href={`/recipes/${recipe.id}/`} className="card group relative">
            <CardActionButtons recipeId={recipe.id} />
            <img src={recipe.thumbnail} alt={`Image of ${recipe.title}`} className="card-image" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/default.jpg'; }} /> 
            <div className="card-body">
              <h2>{recipe.title}</h2>
              <p className="text-muted mt-2">{recipe.description}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}