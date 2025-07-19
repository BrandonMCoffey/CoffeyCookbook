import React, { useState } from 'react';
import { formatQuantity } from '../../utils/formatters.js';

export default function IngredientChecklist({ ingredients }) {
  const [checkedItems, setCheckedItems] = useState(new Set());

  const handleCheck = (index) => {
    const newCheckedItems = new Set(checkedItems);
    newCheckedItems.has(index) ? newCheckedItems.delete(index) : newCheckedItems.add(index);
    setCheckedItems(newCheckedItems);
  };

  return (
    <ul className="space-y-3">
      {ingredients.map((ing, index) => {
        const isChecked = checkedItems.has(index);
        return (
          <label key={index} className="ingredient-item">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => handleCheck(index)}
              className="h-5 w-5 rounded text-green-600 focus:ring-green-500"
            />
            <span className={`ml-3 ${isChecked ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
              {ing.quantity === 0
                ? `${ing.item}, to taste`
                : `${formatQuantity(ing.quantity)} ${ing.unit} ${ing.item}`
              }
            </span>
          </label>
        );
      })}
    </ul>
  );
}