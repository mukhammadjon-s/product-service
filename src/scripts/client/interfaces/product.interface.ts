export interface IProductToIndex {
  item_id: number;
  product_id: string;
  in_stock: boolean;
  variant_id: string;
  sku: string;
  slug: string;
  category_slug: string;
  category_slugs: string[];
  name: string;
  mini_desc: string;
  image: string;
  is_top: boolean;
  category: string;
  brand: string;
  brand_slug: string;
  brand_id: number;
  category_id: number;
  colors: string[];
  prices: number[];
  materials: string[];
  sizes: string[];
}
