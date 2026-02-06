
import React from 'react';
import { CATEGORIES } from '../constants';
import { Category } from '../types';

interface CategoryBarProps {
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
}

const CategoryBar: React.FC<CategoryBarProps> = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="bg-[#030712] border-b border-white/5 py-4 overflow-x-auto custom-scrollbar">
      <div className="max-w-7xl mx-auto px-4 flex gap-10 items-center whitespace-nowrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`text-sm font-bold transition-all ${
              selectedCategory === cat
                ? 'category-active text-white'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryBar;
