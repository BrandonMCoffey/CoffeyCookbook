export type Recipe = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  date: string;
  author: string;
  category: string;
  cuisines: string[];
  diets: string[];
  cookware: string[];
  time: {
    prep: number;
    cook: number;
    rest: number;
  };
  servings: number;
  ingredients: {
    item: string;
    quantity: number | string;
    unit: string;
  }[];
  instructions: string[];
  tips: string;
}