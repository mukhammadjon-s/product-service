export class PublishDto {
  variantGroupId: string;
  images: string[];
  product: {
    categoryId: string;
    categories: string[];
    season?: string;
    material?: string;
    country?: string;
    gender?: string;
    brandId?: string;
    length?: string;
    weight?: string;
    width?: string;
    height?: string;
    content?: string;
    rating?: number;
  }
}
