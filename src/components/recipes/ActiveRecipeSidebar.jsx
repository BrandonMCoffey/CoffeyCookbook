import React, { useState, useEffect, useCallback } from 'react';
import { formatTime } from '../../utils/formatters.js';

export default function ActiveRecipeSidebar({ allRecipes }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeRecipes, setActiveRecipes] = useState([]);

  useEffect(() => {
    const bodyEl = document.body;
    if (isOpen) bodyEl.classList.add('sidebar-open');
    else bodyEl.classList.remove('sidebar-open');
    return () => bodyEl.classList.remove('sidebar-open');
  }, [isOpen]);

  const updateActiveRecipes = useCallback(() => {
    const activeIds = JSON.parse(localStorage.getItem('active_recipes') || '[]');
    const filtered = allRecipes.filter(recipe => activeIds.includes(recipe.id));
    setActiveRecipes(filtered);
  }, [allRecipes]);
  
  useEffect(() => {
    updateActiveRecipes();
    const handleStorageUpdate = () => updateActiveRecipes();
    window.addEventListener('storageupdate', handleStorageUpdate);
    return () => {
      window.removeEventListener('storageupdate', handleStorageUpdate);
    };
  }, [updateActiveRecipes]);

  const handleRemoveRecipe = (e, recipeId) => {
    e.preventDefault();
    const activeIds = JSON.parse(localStorage.getItem('active_recipes') || '[]').filter(id => id !== recipeId);
    localStorage.setItem('active_recipes', JSON.stringify(activeIds));
    window.dispatchEvent(new Event('storageupdate'));
  };

  return (
    <div className="hidden lg:block">
      <aside className={`fixed top-16 right-0 h-[calc(100vh-4rem)] w-full max-w-sm card-static shadow-xl z-20 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <button 
            onClick={() => setIsOpen(!isOpen)}
            className="absolute top-4 -left-10 bg-slate-800 text-white p-2 rounded-l-md shadow-lg z-40 hover:bg-slate-700 transition-colors"
            title="Toggle Active Recipes"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-6 h-6 transition-transform ${isOpen && 'rotate-180'}`}> 
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            <span className="absolute -top-2 -left-2 flex h-5 w-5">
                <span className="relative inline-flex rounded-full h-5 w-5 bg-green-500 items-center justify-center text-xs font-bold text-white">
                     {activeRecipes.length} 
                </span>
            </span>
        </button>
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center">
                     <h2 className="text-2xl font-bold">Active Recipes</h2> 
                </div>
                <a href="/recipes/shopping-list" className="block w-full text-center mt-4 btn btn-primary">Go to Shopping List</a>
            </div>
            
            <div className="flex-grow overflow-y-auto p-4 space-y-4"> 
                {activeRecipes.length > 0 ? activeRecipes.map(recipe => { 
                    const totalTime = (recipe.time.prep || 0) + (recipe.time.cook || 0) + (recipe.time.rest || 0);
                    return (
                        <div key={recipe.id} className="flex gap-4 p-2 border border-slate-200 dark:border-slate-700 rounded-md">
                           <img src={recipe.thumbnail} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/default.jpg'; }} alt="" className="w-20 h-20 object-cover rounded-md flex-shrink-0" /> 
                            <div className="flex-grow">
                                <h3 className="font-semibold">{recipe.title}</h3>
                                 <p className="text-sm text-muted">Time: {formatTime(totalTime)}</p> 
                                <p className="text-sm text-muted">Cookware: {recipe.cookware?.length || 0} items</p>
                            </div>
                             <button onClick={(e) => handleRemoveRecipe(e, recipe.id)} className="btn-remove self-start flex-shrink-0" title="Remove Recipe"> 
                                <span className="font-bold text-sm">×</span>
                            </button>
                         </div> 
                    );
                }) : <p className="text-muted text-center mt-8">No active recipes.</p>} 
            </div>
        </div>
      </aside>
    </div>
  );
}