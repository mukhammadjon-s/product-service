export class ProductEventMessage {
    constructor(
        public params: {
            product_id: string;
            rating: number;
            slug: string;
            name: string;
            is_top: boolean;
            brand_id: string;
            category_id: string;
            status: string;
            colors: string[];
            prices: number[];
            prices_with_discount: number[];
            materials: string[];
            sizes: string[];
            material?: string;
            gender?: string;
            country?: string;
            company_id: number;
            is_published: boolean;
            category_ids: string[];
            image: string;
            created_at: string;
            updated_at: string;
            // category_slug: string;
            // category_slugs: string[];
            // mini_desc: string;
            // image: string;
            // category: string;
            // brand: string;
            // brand_slug: string;

        },
    ) { }
    toJSON() {
        return { ...this.params };
    }
}
