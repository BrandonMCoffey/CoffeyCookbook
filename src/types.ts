// src/types.ts
export type Recipe = {
  id: string;
  title: string;
  thumbnail: string;
  category: string;
  cuisines: string[];
  time: {
    prep: string;
    cook: string;
    rest: string;
    total?: string; // Optional property
  };
  servings: number;
  date: string;
  author: string;
  description: string;
  ingredients: {
    item: string;
    quantity: number;
    unit: string;
  }[];
  instructions: string[];
  tips: string;
}