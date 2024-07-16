// Keep this interface in sync with hooks service.
export interface ProductMessageEventSchema {
  id: string;
  colors?: string[];
  brand: string;
  brand_id?: string;
  brand_slug?: string;
  category?: string;
  category_id?: string;
  category_slug?: string;
  category_slugs?: string[];
  image?: string;
  is_top?: boolean;
  material?: string;
  merchantId?: string;
  merchantName?: string;
  mini_desc?: string;
  name?: string;
  content?: string;
  description?: string;
  prices?: number[];
  product_id: string;
  rating?: number;
  sizes?: string[];
  variant_slugs?: string[];
  sku?: string;
  item_id: number;
  collectionName: string;
}
