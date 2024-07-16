export class VariantGroupEventMessage {
    constructor(
        public params: {
            product_id: string,
            status: string,
            in_stock: boolean,
            rating: number,
            sku: string,
            name: string,
            brand_id: string,
            category_id: string,
            category_ids: string[],
            company_id: number,
            variant_group_slug: string,
            variant_group_id: string,
            is_top: boolean,
            colors: string[],
            sizes: string[],
            min_price: number,
            min_price_discount: number,
            prices: number[],
            material: string,
            country: string,
            gender: string,
            images: string[],
            popularity: number,
            created_at: string,
            updated_at: string,
            variant_ids: string[],
            discountAmount: number,
            is_published: boolean,
        },
    ) { }
    toJSON() {
        return { ...this.params };
    }
}
