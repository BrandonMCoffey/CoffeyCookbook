import React, { useState, useEffect } from 'react';

export default function ActiveRecipeSidebar({ allRecipes }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeRecipes, setActiveRecipes] = useState([]);

  const updateActiveRecipes = () => {
    const activeIds = JSON.parse(localStorage.getItem('active_recipes') || '[]');
    const filtered = allRecipes.filter(recipe => activeIds.includes(recipe.id));
    setActiveRecipes(filtered);
  };
  
  useEffect(() => {
    updateActiveRecipes();
    
    const handleStorageUpdate = () => updateActiveRecipes();
    window.addEventListener('storageupdate', handleStorageUpdate);
    
    return () => {
      window.removeEventListener('storageupdate', handleStorageUpdate);
    };
  }, [allRecipes]);

  const handleRemoveRecipe = (e, recipeId) => {
    e.preventDefault();
    const activeIds = JSON.parse(localStorage.getItem('active_recipes') || '[]').filter(id => id !== recipeId);
    localStorage.setItem('active_recipes', JSON.stringify(activeIds));
    window.dispatchEvent(new Event('storageupdate'));
  };

  const calculateTotalTime = (time) => (time.prep || 0) + (time.cook || 0) + (time.rest || 0);

  return (
    <div className="hidden lg:block">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-1/2 right-0 -translate-y-1/2 bg-slate-800 text-white p-2 rounded-l-md shadow-lg z-40 hover:bg-slate-700 transition-colors"
        title="Toggle Active Recipes"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-6 h-6 transition-transform ${isOpen && 'rotate-180'}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        <span className="absolute -top-2 -left-2 flex h-5 w-5">
            <span className="relative inline-flex rounded-full h-5 w-5 bg-green-500 items-center justify-center text-xs font-bold">
                {activeRecipes.length}
            </span>
        </span>
      </button>
      
      <aside className={`fixed top-16 right-0 h-[calc(100vh-4rem)] w-full max-w-sm bg-white shadow-xl z-20 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
            <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Active Recipes</h2>
                    <button onClick={() => setIsOpen(false)} className="p-1 text-2xl font-bold hover:text-red-500">&times;</button>
                </div>
                <a href="/shopping-list" className="block w-full text-center mt-4 btn btn-primary">Go to Shopping List</a>
            </div>
            
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {activeRecipes.length > 0 ? activeRecipes.map(recipe => (
                    <div key={recipe.id} className="flex gap-4 p-2 border rounded-md">
                        <img src={recipe.thumbnail} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/default-thumbnail.jpg'; }} alt="" className="w-20 h-20 object-cover rounded-md flex-shrink-0" />
                        <div className="flex-grow">
                            <h3 className="font-semibold">{recipe.title}</h3>
                            <p className="text-sm text-slate-500">Time: {calculateTotalTime(recipe.time)} min</p>
                            <p className="text-sm text-slate-500">Cookware: {recipe.cookware?.length || 0} items</p>
                        </div>
                        <button onClick={(e) => handleRemoveRecipe(e, recipe.id)} className="btn-remove self-start flex-shrink-0" title="Remove Recipe">
                            <span className="font-bold text-sm">×</span>
                        </button>
                    </div>
                )) : <p className="text-slate-500 text-center mt-8">No active recipes.</p>}
            </div>
        </div>
      </aside>
    </div>
  );
}