import React, { useState, useEffect, useMemo } from 'react';
import { formatQuantity } from '../../utils/formatters.js';

const PRIMARY_SORT_OPTIONS = ['Default', 'Alphabetical (A-Z)'];

function RecipeIngredientGroup({ recipe, checkedItems, handleCheckChange, primarySort, groupChecked }) {
  const sortedIngredients = useMemo(() => {
    let sorted = [...recipe.ingredients];
    if (primarySort === 'Alphabetical (A-Z)') sorted.sort((a, b) => a.item.localeCompare(b.item));
    if (groupChecked) {
      sorted.sort((a, b) => {
        const keyA = `${recipe.id}_${a.item.toLowerCase()}_${a.unit}`;
        const keyB = `${recipe.id}_${b.item.toLowerCase()}_${b.unit}`;
        return checkedItems.has(keyA) - checkedItems.has(keyB);
      });
    }
    return sorted;
  }, [recipe.ingredients, primarySort, groupChecked, checkedItems]);

  return (
    <div className="space-y-3 mt-3 pl-4 border-l-2">
      {sortedIngredients.map((ing, index) => {
        const key = `${recipe.id}_${ing.item.toLowerCase()}_${ing.unit}`;
        const isChecked = checkedItems.has(key);
        return (
          <label key={index} className="ingredient-item">
            <input type="checkbox" checked={isChecked} onChange={() => handleCheckChange(key)} className="h-5 w-5 rounded text-green-600 focus:ring-green-500" />
            <span className={`ml-3 text-lg w-full ${isChecked ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
              {ing.quantity === 0
                ? `${ing.item}, to taste`
                : `${formatQuantity(ing.quantity)} ${ing.unit} ${ing.item}`
              }
            </span>
          </label>
        );
      })}
    </div>
  );
}

export default function ShoppingList({ allRecipes }) {
  const [activeRecipes, setActiveRecipes] = useState([]);
  const [aggregatedIngredients, setAggregatedIngredients] = useState([]);
  const [checkedItems, setCheckedItems] = useState(new Set());
  
  const [primarySort, setPrimarySort] = useState(PRIMARY_SORT_OPTIONS[0]);
  const [groupChecked, setGroupChecked] = useState(true);
  const [combinedList, setCombinedList] = useState(false);
  const [collapsedRecipes, setCollapsedRecipes] = useState(new Set());

  useEffect(() => {
    const storedActive = JSON.parse(localStorage.getItem('active_recipes') || '[]');
    const currentActiveRecipes = allRecipes.filter(recipe => storedActive.includes(recipe.id));
    setActiveRecipes(currentActiveRecipes);

    const storedCombined = JSON.parse(localStorage.getItem('shopping_list_combined') || 'false');
    setCombinedList(storedCombined);

    const storedGroupChecked = JSON.parse(localStorage.getItem('shopping_list_group_checked') || 'true');
    setGroupChecked(storedGroupChecked);

    const storedChecked = JSON.parse(localStorage.getItem('shopping_list_checked') || '[]');
    setCheckedItems(new Set(storedChecked));

    if (currentActiveRecipes.length > 0) {
      const aggregated = new Map();
      for (const recipe of currentActiveRecipes) {
        for (const ing of recipe.ingredients) {
          const key = `${ing.item.toLowerCase()}_${ing.unit}`;
          const source = { recipeId: recipe.id, ...ing };
          if (aggregated.has(key)) {
            const existing = aggregated.get(key);
            existing.totalQuantity += ing.quantity;
            existing.sources.push(source);
          } else {
            aggregated.set(key, { item: ing.item, unit: ing.unit, totalQuantity: ing.quantity, sources: [source] });
          }
        }
      }
      setAggregatedIngredients(Array.from(aggregated.values()));
    } else {
      setAggregatedIngredients([]);
    }
  }, [allRecipes]);

  const handleCheckChange = (keyOrSources, isAggregated = false) => {
    const newCheckedItems = new Set(checkedItems);
    if (isAggregated) {
      const sources = keyOrSources;
      const allSourceKeys = sources.map(s => `${s.recipeId}_${s.item.toLowerCase()}_${s.unit}`);
      const areAllChecked = allSourceKeys.every(key => newCheckedItems.has(key));
      allSourceKeys.forEach(key => areAllChecked ? newCheckedItems.delete(key) : newCheckedItems.add(key));
    } else {
      const key = keyOrSources;
      newCheckedItems.has(key) ? newCheckedItems.delete(key) : newCheckedItems.add(key);
    }
    setCheckedItems(newCheckedItems);
    localStorage.setItem('shopping_list_checked', JSON.stringify(Array.from(newCheckedItems)));
  };

  const handleCombinedToggle = () => {
    const newCombinedState = !combinedList;
    setCombinedList(newCombinedState);
    localStorage.setItem('shopping_list_combined', JSON.stringify(newCombinedState));
  };

  const handleGroupToggle = () => {
    const newGroupState = !groupChecked;
    setGroupChecked(newGroupState);
    localStorage.setItem('shopping_list_group_checked', JSON.stringify(newGroupState));
  };
  
  const handleCollapseToggle = (recipeId) => {
    const newCollapsed = new Set(collapsedRecipes);
    newCollapsed.has(recipeId) ? newCollapsed.delete(recipeId) : newCollapsed.add(recipeId);
    setCollapsedRecipes(newCollapsed);
  };
  
  const handleRemoveRecipe = (recipeId) => {
    const newActiveIds = JSON.parse(localStorage.getItem('active_recipes') || '[]').filter(id => id !== recipeId);
    localStorage.setItem('active_recipes', JSON.stringify(newActiveIds));
    setActiveRecipes(activeRecipes.filter(recipe => recipe.id !== recipeId));
    
    const newCheckedItems = new Set([...checkedItems].filter(key => !key.startsWith(recipeId)));
    setCheckedItems(newCheckedItems);
    localStorage.setItem('shopping_list_checked', JSON.stringify(Array.from(newCheckedItems)));
    window.dispatchEvent(new Event('storageupdate'));
  };

  const sortedAggregatedIngredients = useMemo(() => {
    let sorted = [...aggregatedIngredients];
    if (primarySort === 'Alphabetical (A-Z)') sorted.sort((a, b) => a.item.localeCompare(b.item));
    if (groupChecked) {
      sorted.sort((a, b) => {
        const isAChecked = a.sources.every(s => checkedItems.has(`${s.recipeId}_${s.item.toLowerCase()}_${s.unit}`));
        const isBChecked = b.sources.every(s => checkedItems.has(`${s.recipeId}_${s.item.toLowerCase()}_${s.unit}`));
        return isAChecked - isBChecked;
      });
    }
    return sorted;
  }, [aggregatedIngredients, primarySort, groupChecked, checkedItems]);

  if (activeRecipes.length === 0) {
    return <p>Your shopping list is empty. Add recipes to your "Active" list to see ingredients here.</p>;
  }

  return (
    <div>
      <div className="space-y-4 mb-8 p-4 border rounded-lg bg-white">
        <div className="sort-group"><span className="font-semibold text-slate-800">Sort by:</span>{PRIMARY_SORT_OPTIONS.map(option => <button key={option} onClick={() => setPrimarySort(option)} className={`sort-btn ${primarySort === option ? 'active' : ''}`}>{option}</button>)}</div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
           <div className="flex items-center"><input type="checkbox" id="combined-toggle" checked={combinedList} onChange={handleCombinedToggle} className="h-4 w-4 rounded text-green-600 focus:ring-green-500" /><label htmlFor="combined-toggle" className="ml-2 text-sm text-slate-700 cursor-pointer">Combined list</label></div>
           <div className="flex items-center"><input type="checkbox" id="group-checked-toggle" checked={groupChecked} onChange={handleGroupToggle} className="h-4 w-4 rounded text-green-600 focus:ring-green-500" /><label htmlFor="group-checked-toggle" className="ml-2 text-sm text-slate-700 cursor-pointer">Group checked at bottom</label></div>
        </div>
      </div>

      {combinedList ? (
        <div className="space-y-3">
            {sortedAggregatedIngredients.map((ing) => {
                const isChecked = ing.sources.length > 0 && ing.sources.every(s => checkedItems.has(`${s.recipeId}_${s.item.toLowerCase()}_${s.unit}`));
                const checkedCount = ing.sources.filter(s => checkedItems.has(`${s.recipeId}_${s.item.toLowerCase()}_${s.unit}`)).length;
                const totalSources = ing.sources.length;

                return (
                <label key={ing.item + ing.unit} className="ingredient-item">
                    <input type="checkbox" checked={isChecked} onChange={() => handleCheckChange(ing.sources, true)} className="h-5 w-5 rounded text-green-600 focus:ring-green-500" />
                    <span className={`ml-3 text-lg w-full ${isChecked ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                    {ing.totalQuantity === 0
                        ? `${ing.item}, to taste`
                        : `${formatQuantity(ing.totalQuantity)} ${ing.unit} ${ing.item}`
                    }
                    </span>
                    {totalSources > 1 && (<span className="text-sm text-slate-500 ml-2 whitespace-nowrap">({checkedCount}/{totalSources})</span>)}
                </label>
                );
            })}
            </div>
        ) : (
        <div className="space-y-4">
          {activeRecipes.map(recipe => {
            const isCollapsed = collapsedRecipes.has(recipe.id);
            const totalIngredients = recipe.ingredients.length;
            const checkedIngredientsCount = recipe.ingredients.filter(ing => checkedItems.has(`${recipe.id}_${ing.item.toLowerCase()}_${ing.unit}`)).length;

            return (
            <div key={recipe.id}>
              <div className="recipe-header">
                <div className="flex items-center gap-3 flex-grow">
                    <button onClick={() => handleCollapseToggle(recipe.id)} className="p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={`w-4 h-4 text-slate-500 collapse-arrow ${!isCollapsed && 'open'}`}><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                    </button>
                    <h3 className="font-bold text-slate-800">{recipe.title}</h3>
                    {totalIngredients > 0 && (
                      <span className="text-sm font-normal text-slate-500">
                        ({checkedIngredientsCount}/{totalIngredients})
                      </span>
                    )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <a href={`/recipes/${recipe.id}/`} className="btn btn-secondary text-xs !px-2 !py-1">Visit Recipe</a>
                    <button onClick={() => handleRemoveRecipe(recipe.id)} className="btn-remove" title="Remove Recipe"><span className="font-bold text-sm">×</span></button>
                </div>
              </div>
              {!isCollapsed && (<RecipeIngredientGroup recipe={recipe} checkedItems={checkedItems} handleCheckChange={handleCheckChange} primarySort={primarySort} groupChecked={groupChecked} />)}
            </div>
          )})}
        </div>
      )}
    </div>
  );
}