export class VariantEventMessage {
  constructor(
    public params: {
      price: number,
      product_id: string,
      product_name: string,
      status: string,
      sku: string,
      variant_group_id: string,
      color: string,
      size: string,
      company_id: number,
      images: string[],
      created_at: string,
      updated_at: string,
      variant_id: string,
      warehouse_id: string,
      quantity: number,
      rating: number,
      discountPercentage: number
      // product_slug: string,
      // variant_group_slug: string,
      // material: string,
      // country: string,
      // gender: string,
      // barcode: string,
    },
  ) { }
  toJSON() {
    return { ...this.params };
  }
}
