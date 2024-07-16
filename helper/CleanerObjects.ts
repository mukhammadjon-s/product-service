export class CleanerObjects {
  protected cleanVariant(data: any) {
    return {
      ...data,
      product: undefined,
      variantValues: undefined,
    };
  }
  protected cleanBrand(data: any) {
    return {
      ...data,
      products: undefined,
    };
  }
  protected cleanCategory(data: any) {
    return {
      ...data,
      variantFields: undefined,
      variantValues: undefined,
      characteristicGroups: undefined,
    };
  }
  protected cleanCharacteristics(data: any) {
    return {
      ...data,
      group: undefined,
      product: undefined,
    };
  }
}
