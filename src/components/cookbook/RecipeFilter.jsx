import React, { useState, useMemo } from 'react';
import RecipeCard from './RecipeCard';

const TIME_RANGES = [
  { label: '<30 min', maxMinutes: 30 },
  { label: '30 min - 1 hr', minMinutes: 30, maxMinutes: 60 },
  { label: '1-2 hr', minMinutes: 60, maxMinutes: 120 },
  { label: '2-4 hr', minMinutes: 120, maxMinutes: 240 },
  { label: '4+ hr', minMinutes: 240, maxMinutes: Infinity },
];

const COOKWARE_RANGES = [
  { label: '1 Item', max: 1 },
  { label: '2-3 Items', min: 2, max: 3 },
  { label: '4+ Items', min: 4, max: Infinity },
];

const MANUAL_CATEGORY_ORDER = [
  "Breakfast", "Appetizer", "Soup", "Main Course", "Side Dish", "Dessert", "Bread", "Sauce", "Condiment",
];

const SORT_MODES = ['Default', 'Alphabetical', 'Complexity', 'Random'];

export default function RecipeFilter({ allRecipes, categories, cuisines, diets }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategories, setActiveCategories] = useState(new Set());
  const [activeCuisines, setActiveCuisines] = useState(new Set());
  const [activeDiets, setActiveDiets] = useState(new Set());
  const [timeFilter, setTimeFilter] = useState(null);
  const [cookwareFilter, setCookwareFilter] = useState(null);
  const [sortMode, setSortMode] = useState('Default');
  const [sortDirection, setSortDirection] = useState('asc');
  const [randomSeed, setRandomSeed] = useState(0);

  const handleTagToggle = (stateSet, setter, item) => {
    const newSet = new Set(stateSet);
    if (newSet.has(item)) newSet.delete(item);
    else newSet.add(item);
    setter(newSet);
  };

  const handleRangeToggle = (currentFilter, setter, range) => {
    if (currentFilter?.label === range.label) setter(null);
    else setter(range);
  };

  const handleSortChange = (mode) => {
    if (mode === 'Random') {
      setSortMode('Random');
      setRandomSeed(Math.random());
      return;
    }
    if (sortMode === mode) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortMode(mode);
      setSortDirection('asc');
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setActiveCategories(new Set());
    setActiveCuisines(new Set());
    setActiveDiets(new Set());
    setTimeFilter(null);
    setCookwareFilter(null);
    setSortMode('Default');
    setSortDirection('asc');
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

  const searchedRecipes = useMemo(() => {
    if (!searchQuery) return allRecipes;
    const lowerCaseQuery = searchQuery.toLowerCase();
    return allRecipes.filter(recipe => {
      const searchableContent = [
        recipe.title, recipe.description, recipe.category, recipe.author,
        ...(recipe.cuisines || []), ...(recipe.diets || []), ...(recipe.cookware || []),
        ...(recipe.ingredients?.map(i => i.item) || [])
      ].join(' ').toLowerCase();
      return searchableContent.includes(lowerCaseQuery);
    });
  }, [allRecipes, searchQuery]);

  const baseFilters = useMemo(() => {
    let filtered = searchedRecipes;
    if (activeCategories.size > 0) filtered = filtered.filter(r => activeCategories.has(r.category));
    if (activeCuisines.size > 0) filtered = filtered.filter(r => r.cuisines?.some(c => activeCuisines.has(c)));
    if (activeDiets.size > 0) filtered = filtered.filter(r => r.diets?.some(d => activeDiets.has(d)));
    return filtered;
  }, [searchedRecipes, activeCategories, activeCuisines, activeDiets]);
  
  const filteredRecipes = useMemo(() => {
    let filtered = baseFilters;
    if (timeFilter) filtered = filtered.filter(recipe => {
        const totalTime = (recipe.time.prep || 0) + (recipe.time.cook || 0) + (recipe.time.rest || 0);
        const min = timeFilter.minMinutes || 0;
        const max = timeFilter.maxMinutes || Infinity;
        return totalTime > min && totalTime <= max;
    });
    if (cookwareFilter) filtered = filtered.filter(recipe => {
        const count = recipe.cookware?.length || 0;
        const min = cookwareFilter.min || 0;
        const max = cookwareFilter.max || Infinity;
        return count >= min && count <= max;
    });
    return filtered;
  }, [baseFilters, timeFilter, cookwareFilter]);

  const sortedRecipes = useMemo(() => {
    const toSort = [...filteredRecipes];
    switch (sortMode) {
      case 'Alphabetical':
        toSort.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'Complexity':
        toSort.sort((a, b) => {
          const cookwareA = a.cookware?.length || 0;
          const cookwareB = b.cookware?.length || 0;
          const timeA = (a.time.prep || 0) + (a.time.cook || 0) + (a.time.rest || 0);
          const timeB = (b.time.prep || 0) + (b.time.cook || 0) + (b.time.rest || 0);
          return cookwareA - cookwareB + (timeA - timeB) / 120;
        });
        break;
      case 'Random':
        toSort.sort(() => Math.random() - 0.5);
        break;
      default:
        return toSort;
    }
    if (sortDirection === 'desc') toSort.reverse();
    return toSort;
  }, [filteredRecipes, sortMode, sortDirection, randomSeed]);

  const getCountForRange = (range, type) => {
    let filtered = baseFilters;
    if (type === 'time' && cookwareFilter) filtered = filtered.filter(r => {
        const count = r.cookware?.length || 0;
        return count >= (cookwareFilter.min || 0) && count <= (cookwareFilter.max || Infinity);
    });
    else if (type === 'cookware' && timeFilter) filtered = filtered.filter(r => {
        const totalTime = (r.time.prep || 0) + (r.time.cook || 0) + (r.time.rest || 0);
        return totalTime > (timeFilter.minMinutes || 0) && totalTime <= (timeFilter.maxMinutes || Infinity);
    });

    if (type === 'time') return filtered.filter(r => {
        const totalTime = (r.time.prep || 0) + (r.time.cook || 0) + (r.time.rest || 0);
        return totalTime > (range.minMinutes || 0) && totalTime <= (range.maxMinutes || Infinity);
    }).length;
    else return filtered.filter(r => {
        const count = r.cookware?.length || 0;
        return count >= (range.min || 0) && count <= (range.max || Infinity);
    }).length;
  };
  
  const dynamicCategoryCounts = useMemo(() => {
      const counts = new Map();
      let filtered = searchedRecipes;
      if (activeCuisines.size > 0) filtered = filtered.filter(r => r.cuisines?.some(c => activeCuisines.has(c)));
      if (activeDiets.size > 0) filtered = filtered.filter(r => r.diets?.some(d => activeDiets.has(d)));
      if (timeFilter) filtered = filtered.filter(r => { const t = (r.time.prep||0)+(r.time.cook||0)+(r.time.rest||0); return t > (timeFilter.minMinutes || 0) && t <= (timeFilter.maxMinutes || Infinity)});
      if (cookwareFilter) filtered = filtered.filter(r => { const c = r.cookware?.length || 0; return c >= (cookwareFilter.min || 0) && c <= (cookwareFilter.max || Infinity)});
      filtered.forEach(r => counts.set(r.category, (counts.get(r.category) || 0) + 1));
      return counts;
  }, [searchedRecipes, activeCuisines, activeDiets, timeFilter, cookwareFilter]);

  const dynamicCuisineCounts = useMemo(() => {
      const counts = new Map();
      let filtered = searchedRecipes;
      if (activeCategories.size > 0) filtered = filtered.filter(r => activeCategories.has(r.category));
      if (activeDiets.size > 0) filtered = filtered.filter(r => r.diets?.some(d => activeDiets.has(d)));
      if (timeFilter) filtered = filtered.filter(r => { const t = (r.time.prep||0)+(r.time.cook||0)+(r.time.rest||0); return t > (timeFilter.minMinutes || 0) && t <= (timeFilter.maxMinutes || Infinity)});
      if (cookwareFilter) filtered = filtered.filter(r => { const c = r.cookware?.length || 0; return c >= (cookwareFilter.min || 0) && c <= (cookwareFilter.max || Infinity)});
      filtered.forEach(r => r.cuisines?.forEach(c => counts.set(c, (counts.get(c) || 0) + 1)));
      return counts;
  }, [searchedRecipes, activeCategories, activeDiets, timeFilter, cookwareFilter]);

  const dynamicDietCounts = useMemo(() => {
      const counts = new Map();
      let filtered = searchedRecipes;
      if (activeCategories.size > 0) filtered = filtered.filter(r => activeCategories.has(r.category));
      if (activeCuisines.size > 0) filtered = filtered.filter(r => r.cuisines?.some(c => activeCuisines.has(c)));
      if (timeFilter) filtered = filtered.filter(r => { const t = (r.time.prep||0)+(r.time.cook||0)+(r.time.rest||0); return t > (timeFilter.minMinutes || 0) && t <= (timeFilter.maxMinutes || Infinity)});
      if (cookwareFilter) filtered = filtered.filter(r => { const c = r.cookware?.length || 0; return c >= (cookwareFilter.min || 0) && c <= (cookwareFilter.max || Infinity)});
      filtered.forEach(r => r.diets?.forEach(d => counts.set(d, (counts.get(d) || 0) + 1)));
      return counts;
  }, [searchedRecipes, activeCategories, activeCuisines, timeFilter, cookwareFilter]);


  return (
    <div>
      <div className="space-y-4 mb-12 p-4 card-static">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Filter & Sort</h2>
          <button onClick={clearAllFilters} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Clear All</button>
        </div>

        <div><h3 className="font-semibold mb-2">Category</h3><div className="flex flex-wrap gap-2">{manuallySortedCategories.map(({ name }) => { const count = dynamicCategoryCounts.get(name) || 0; return (<button key={name} onClick={() => handleTagToggle(activeCategories, setActiveCategories, name)} className={`sort-btn ${activeCategories.has(name) ? 'active' : ''}`} disabled={!activeCategories.has(name) && count === 0}>{name} <span className="ml-1.5 opacity-75">({count})</span></button>);})}</div></div>
        <div><h3 className="font-semibold mb-2">Cuisine</h3><div className="flex flex-wrap gap-2">{cuisines.map(({ name }) => { const count = dynamicCuisineCounts.get(name) || 0; return (<button key={name} onClick={() => handleTagToggle(activeCuisines, setActiveCuisines, name)} className={`sort-btn ${activeCuisines.has(name) ? 'active' : ''}`} disabled={!activeCuisines.has(name) && count === 0}>{name} <span className="ml-1.5 opacity-75">({count})</span></button>);})}</div></div> 
        <div><h3 className="font-semibold mb-2">Diet</h3><div className="flex flex-wrap gap-2">{diets.map(({ name }) => { const count = dynamicDietCounts.get(name) || 0; return (<button key={name} onClick={() => handleTagToggle(activeDiets, setActiveDiets, name)} className={`sort-btn ${activeDiets.has(name) ? 'active' : ''}`} disabled={!activeDiets.has(name) && count === 0}>{name} <span className="ml-1.5 opacity-75">({count})</span></button>);})}</div></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div><h3 className="font-semibold mb-2">Max Time</h3><div className="flex flex-wrap gap-2">{TIME_RANGES.map(range => { const count = getCountForRange(range, 'time'); return (<button key={range.label} onClick={() => handleRangeToggle(timeFilter, setTimeFilter, range)} className={`sort-btn ${timeFilter?.label === range.label ? 'active' : ''}`} disabled={timeFilter?.label !== range.label && count === 0}>{range.label} <span className="ml-1.5 opacity-75">({count})</span></button>)})}</div></div>
          <div><h3 className="font-semibold mb-2">Max Cookware</h3><div className="flex flex-wrap gap-2">{COOKWARE_RANGES.map(range => { const count = getCountForRange(range, 'cookware'); return (<button key={range.label} onClick={() => handleRangeToggle(cookwareFilter, setCookwareFilter, range)} className={`sort-btn ${cookwareFilter?.label === range.label ? 'active' : ''}`} disabled={cookwareFilter?.label !== range.label && count === 0}>{range.label} <span className="ml-1.5 opacity-75">({count})</span></button>)})}</div></div>
        </div>

        <br />
        <div className="relative">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recipes, ingredients, authors..."
            className="w-full pl-10 pr-4 py-2 border rounded-full bg-slate-100 dark:bg-slate-700 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Sort Mode</h3>
          <div className="flex flex-wrap gap-2">
            {SORT_MODES.map(mode => {
              let buttonText = mode;
              if (sortMode === mode) {
                if (mode === 'Alphabetical') {
                  buttonText += sortDirection === 'asc' ? ' (A-Z)' : ' (Z-A)';
                } else if (mode === 'Complexity') {
                  buttonText += sortDirection === 'asc' ? ' (Low-High)' : ' (High-Low)';
                }
              }
              return (
                <button key={mode} onClick={() => handleSortChange(mode)} className={`sort-btn ${sortMode === mode ? 'active' : ''}`}>{buttonText}</button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mb-4"><p className="text-lg font-semibold">{sortedRecipes.length} Recipes Found</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}