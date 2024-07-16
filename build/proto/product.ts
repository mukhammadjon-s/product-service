/* eslint-disable */

export const protobufPackage = 'product';

export interface EmptyReq {
}

export interface GetVariantGroupRequest {
slug: string,
}

export interface GetVariantGroupByIdRequest {
id: string,
}

export interface GetVariantGroupResponse {
data: VariantGroupSlug | undefined,
}

export interface AddVPReq {
productId: string,
image: string,
}

export interface UpdateVPReq {
productId: string,
images: VariantGroupImages[],
id: string,
sku?: string | undefined,
}

export interface DelVPReq {
productId: string,
id: string,
}

export interface GetVGReq {
productId: string,
}

export interface AddVPRes {
data: VariantGroup | undefined,
}

export interface GetVGRes {
data: VariantGroup[],
}

export interface VariantGroupsSetImageRequest {
photos: string[],
sku: string,
groupId: string,
}

export interface VariantGroupsResponseItem {
id: string,
color: string,
sku: string,
sizes: string,
photos: string[],
}

export interface VariantGroupsResponse {
data: VariantGroupsResponseItem[],
}

export interface VariantPhoto {
id: string,
image: string,
}

export interface VariantCreate {
id?: string | undefined,
status: VariantCreate_VariantStatusEnum,
/** int32 warehouseId = 3; */
companyId: number,
price: number,
quantity: number,
productId: string,
extId?: string | undefined,
length?: string | undefined,
weight?: string | undefined,
width?: string | undefined,
height?: string | undefined,
barcode?: string | undefined,
discountPercentage?: number | undefined,
values: variantValues | undefined,
sku: string,
warehouses: Warehouse[],
rating?: number | undefined
}

export enum VariantCreate_VariantStatusEnum {
ACTIVE = 0,
INACTIVE = 1,
UNRECOGNIZED = -1,
}

export interface variantValues {
translation: {[key: string]: any} | undefined,
ord: string,
type: string,
}

export interface VariantValuesWithMultipleSizes {
  values: variantValues[];
}

export interface values {
id?: string | undefined,
translation?: {[key: string]: any} | undefined,
}

export interface fields {
id?: string | undefined,
ord?: string | undefined,
slug?: string | undefined,
type?: string | undefined,
translation?: {[key: string]: any} | undefined,
values: values[],
}

export interface GetTreeCategoryReq {
}

export interface GetTreeCategoryRes {
data: {[key: string]: any} | undefined,
}

export interface GetAllVVReq {
variantField: boolean,
variants: boolean,
where: GetVVWhereReq | undefined,
page?: number | undefined,
pagesize?: number | undefined,
}

export interface GetAllVVRes {
data: VariantValue[],
page?: number | undefined,
total?: number | undefined,
}

export interface GetVVWhereReq {
id?: string | undefined,
}

export interface GetOneVVRes {
data: VariantField | undefined,
}

export interface TranslateVV {
value: Translate | undefined,
}

export interface CreateVVReq {
variantField?: CreateVVVariantField | undefined,
variants: CreateProductVariantsRequest[],
/** optional TranslateVV translation = 3; */
translation?: {[key: string]: any} | undefined,
}

export interface UpdateVVReq {
id?: string | undefined,
/** optional TranslateVV translation = 2; */
translation?: {[key: string]: any} | undefined,
}

export interface CreateVVVariantField {
create?: Variant | undefined,
connect?: CreateProductVariantsConnectRequest | undefined,
ord: string,
type: string,
slug: string,
/** optional VariantFieldTranslation translation = 6; */
translation?: {[key: string]: any} | undefined,
value?: string | undefined,
}

/** /// */
export interface GetAllChGReq {
categories: boolean,
products: boolean,
characteristics: boolean,
where: GetChGWhereReq | undefined,
page?: number | undefined,
pagesize?: number | undefined,
}

export interface GetAllChGRes {
data: VariantField[],
page?: number | undefined,
total?: number | undefined,
}

export interface GetChGWhereReq {
id?: string | undefined,
}

export interface GetOneChGRes {
data: VariantField | undefined,
}

export interface CreateChGTranslationReq {
name: Translate | undefined,
}

export interface CreateChGReq {
brandId?: CreateProductBrandRequest | undefined,
categories: CreateProductCategoriesRequest[],
variantValues: CreateProductVariantsRequest[],
characteristics: CreateProductCharacteristicRequest[],
/** CreateVFTranslationReq translation = 16; */
translation: {[key: string]: any} | undefined,
}

export interface UpdateChGReq {
id: string,
ord: string,
type: string,
slug: string,
}

/** ////// */
export interface GetAllCharReq {
categories: boolean,
variantValue: boolean,
where: GetCharWhereReq | undefined,
page?: number | undefined,
pagesize?: number | undefined,
}

export interface GetAllCharRes {
data: VariantField[],
page?: number | undefined,
total?: number | undefined,
}

export interface GetCharWhereReq {
id?: string | undefined,
ord?: string | undefined,
type?: string | undefined,
slug?: boolean | undefined,
}

export interface GetOneCharFieldRes {
data: Characteristic | undefined,
}

export interface CreateCharGroupRequest {
products: string[],
characteristics: string[],
categories: string[],
}

export interface CreateCharReq {
status: CreateCharReq_CharacteristicStatus,
group?: CreateCharGroupRequest | undefined,
product?: CreateVariantProduct | undefined,
}

export enum CreateCharReq_CharacteristicStatus {
ACTIVE = 0,
INACTIVE = 1,
PENDING = 2,
ARCHIVED = 3,
UNRECOGNIZED = -1,
}

export interface UpdateCharReq {
status: UpdateCharReq_CharacteristicStatus,
}

export enum UpdateCharReq_CharacteristicStatus {
ACTIVE = 0,
INACTIVE = 1,
PENDING = 2,
ARCHIVED = 3,
UNRECOGNIZED = -1,
}

export interface GetOneVariantFieldReq {
categories: boolean,
variantValue: boolean,
where: GetVariantFieldWhereReq | undefined,
id: string,
}

export interface GetAllVariantFieldReq {
categories: boolean,
variantValue: boolean,
where: GetVariantFieldWhereReq | undefined,
page?: number | undefined,
pagesize?: number | undefined,
}

export interface GetAllVariantFieldRes {
data: VariantField[],
page?: number | undefined,
total?: number | undefined,
}

export interface GetVariantFieldWhereReq {
id?: string | undefined,
ord?: string | undefined,
type?: string | undefined,
slug?: boolean | undefined,
}

export interface GetOneVariantFieldRes {
data: VariantField | undefined,
}

export interface CreateVFTranslationReq {
name: Translate | undefined,
}

export interface CreateVFReq {
brandId?: CreateProductBrandRequest | undefined,
categories: CreateProductCategoriesRequest[],
variantValues: CreateProductVariantsRequest[],
characteristics: CreateProductCharacteristicRequest[],
ord: string,
type: string,
slug: string,
/** CreateVFTranslationReq translation = 16; */
translation: {[key: string]: any} | undefined,
}

export interface UpdateVFReq {
id: string,
ord: string,
type: string,
slug: string,
}

export interface GetAllCharacteristicsRequest {
product?: boolean | undefined,
}

export interface GetAllCharacteristicsResponse {
}

export interface UpdateVariantsReq {
  variants: UpdateVariantReq[];
}

export interface UpdateVariantReq {
id: string,
productId?: string | undefined,
status?: string | undefined,
/** optional int32 warehouseId = 4; */
companyId?: number | undefined,
price?: number | undefined,
quantity?: number | undefined,
reservedQuantity?: number | undefined,
extId?: string | undefined,
length?: string | undefined,
weight?: string | undefined,
width?: string | undefined,
height?: string | undefined,
warehouses: Warehouse[],
sku?: string | undefined,
values?: VariantValuesWithMultipleSizes | undefined,
material?: string | undefined,
gender?: string | undefined,
country?: string | undefined,
barcode?: string | undefined,
discountPercentage?: number | undefined,
rating?: number | undefined
}

export interface UpdateVariantRes {
data: Variant | undefined,
}

export interface UpdateStatusVariantReq {
id: string,
status?: string | undefined,
}

export interface UpdateStatusVariantRes {
data: Variant | undefined,
}

export interface GetProductVariantReq {
productId: string,
product: boolean,
variantValues: boolean,
where: GetVariantWhereRequest | undefined,
page?: number | undefined,
pagesize?: number | undefined,
}

export interface GetVariantWhereRequest {
id?: string | undefined,
status: string,
warehouseId: number | string,
companyId: number,
price: number,
quantity: number,
reservedQuantity: number,
extId: string,
length: string,
weight: string,
width: string,
height: string,
productId: string,
}

export enum GetVariantWhereRequest_VariantStatus {
ACTIVE = 0,
INACTIVE = 1,
UNRECOGNIZED = -1,
}

export interface GetProductVariantRes {
data: Variant[],
page?: number | undefined,
total?: number | undefined,
}

export interface GetOneVariantReq {
id: string,
}

export interface GetProductByVariantIdReq {
id: string,
}

export interface GetProductByVariantIdRes {
data: Product | undefined,
}

export interface GetOneVariantRes {
data: Variant | undefined,
}

export interface ConnectModel {
id: string,
}

export interface TranslatedVariantValue {
value?: Translate | undefined,
}

export interface VariantValueCreateForVariant {
/** optional TranslatedVariantValue translation = 1; */
translation?: {[key: string]: any} | undefined,
}

export interface CreateVariantVariantValues {
create?: VariantValueCreateForVariant | undefined,
connect?: ConnectModel | undefined,
}

export interface CreateProductForVariant {
id?: string | undefined,
status?: string | undefined,
companyId?: string | undefined,
isSale?: boolean | undefined,
isTop?: boolean | undefined,
isPreorder?: boolean | undefined,
image?: string | undefined,
minAge?: number | undefined,
length?: string | undefined,
weight?: string | undefined,
width?: string | undefined,
height?: string | undefined,
name?: string | undefined,
description?: string | undefined,
content?: string | undefined,
}

export interface CreateVariantProduct {
create?: CreateProductForVariant | undefined,
connect?: ConnectModel | undefined,
}

export interface AddNewVariantReq {
status: AddNewVariantReq_VariantStatusEnum,
warehouseId: number,
companyId: number,
price: number,
/** default 0 */
quantity: number,
/** int32 reservedQuantity = 7; */
extId?: string | undefined,
length?: string | undefined,
weight?: string | undefined,
width?: string | undefined,
height?: string | undefined,
barcode?: string | undefined,
discountPercentage?: number | undefined,
warehouses: Warehouse[],
variantValues: CreateVariantVariantValues[],
product: CreateVariantProduct | undefined,
mainField?: string | undefined,
rating?: number | undefined,
}

export enum AddNewVariantReq_VariantStatusEnum {
ACTIVE = 0,
INACTIVE = 1,
UNRECOGNIZED = -1,
}

export interface AddNewVariantRes {
data: Variant | undefined,
}

export interface GetAllVariantReq {
product: boolean,
variantValues: boolean,
where: GetVariantWhereRequest | undefined,
page?: number | undefined,
pagesize?: number | undefined,
}

export interface GetAllVariantsReq {
  filters?: {
    productId?: string;
    warehouseId?: string;
    where: GetVariantWhereRequest | undefined,
  };
  fieldsToLoad: {
    product: boolean,
    brand: boolean,
    categories: boolean,
  };
  pagination?: {
    page: number;
    pagesize: number;
  }
}

export interface GetAllVariantRes {
data: Variant[],
page?: number | undefined,
total?: number | undefined,
}

export interface CreateProductBrandConnectRequest {
id?: string | undefined,
name?: string | undefined,
}

export interface CreateProductCategoriesConnectRequest {
id?: string | undefined,
status?: string | undefined,
image?: string | undefined,
length?: string | undefined,
weight?: string | undefined,
width?: string | undefined,
height?: string | undefined,
}

export interface CreateProductVariantsConnectRequest {
id?: string | undefined,
status?: string | undefined,
warehouseId?: number | undefined,
companyId?: number | undefined,
price?: number | undefined,
quantity?: number | undefined,
reservedQuantity?: number | undefined,
extId?: string | undefined,
length?: string | undefined,
weight?: string | undefined,
width?: string | undefined,
height?: string | undefined,
}

export interface CreateProductCategoriesRequest {
create?: CreateProductVariantsConnectRequest | undefined,
connect?: CreateProductCategoriesConnectRequest | undefined,
}

export interface CreateProductBrandRequest {
create?: Brand | undefined,
connect?: CreateProductBrandConnectRequest | undefined,
}

export interface CreateProductVariantsRequest {
create?: Variant | undefined,
connect?: CreateProductVariantsConnectRequest | undefined,
}

export interface CreateProductCharacteristicConnectionRequest {
id: string,
}

export interface CreateProductCharacteristicRequest {
create?: Characteristic | undefined,
connect?: CreateProductCharacteristicConnectionRequest | undefined,
}

export interface UpdateProductRequest {
id: string,
status?: UpdateProductRequest_ProductStatusEnum | undefined,
companyId?: string | undefined,
isSale?: boolean | undefined,
isTop?: boolean | undefined,
isPreorder?: boolean | undefined,
image?: string | undefined,
minAge?: number | undefined,
length?: string | undefined,
weight?: string | undefined,
width?: string | undefined,
height?: string | undefined,
translation?: {[key: string]: any} | undefined,
brandId?: string | undefined,
categories: string[],
variants?: string[],
characteristics?: string[],
categoryId: string,
rating?: number,
material?: string | undefined,
gender?: string | undefined,
country?: string | undefined,
season?: string | undefined
}

export enum UpdateProductRequest_ProductStatusEnum {
ACTIVE = 0,
INACTIVE = 1,
PENDING = 2,
ARCHIVED = 3,
UNRECOGNIZED = -1,
}

export interface CreateProductTranslationRequest {
name: Translate | undefined,
description: Translate | undefined,
content: Translate | undefined,
}

export interface CreateProductRequest {
status: CreateProductRequest_ProductStatusEnum,
brandId?: string | undefined,
categories: string[],
variants: string[],
characteristics: string[],
companyId: string,
isSale: boolean,
isTop: boolean,
isPreorder: boolean,
image: string,
minAge: number,
length: string,
weight: string,
width: string,
height: string,
translation: {[key: string]: any} | undefined,
categoryId: string,
rating: number,
material?: string | undefined,
gender?: string | undefined,
country?: string | undefined,
season?: string | undefined
productType?: string | undefined;
}

export enum CreateProductRequest_ProductStatusEnum {
ACTIVE = 0,
INACTIVE = 1,
PENDING = 2,
ARCHIVED = 3,
UNRECOGNIZED = -1,
}

export interface CreateProductResponse {
data: ProductCreate | undefined,
}

export interface ProductCreate {
id?: string | undefined,
status: string,
brandId: string,
categories: Category[],
variants: Variant[],
characteristics: Characteristic[],
companyId: string,
isSale: boolean,
isTop: boolean,
isPreorder: boolean,
rating: number,
image: string,
minAge: number,
length: string,
weight: string,
width: string,
height: string,
name?: string | undefined,
description?: string | undefined,
content?: string | undefined,
createdAt?: string | undefined,
updatedAt?: string | undefined,
translation: {[key: string]: any} | undefined,
variantFields: {[key: string]: any} | undefined,
slug?: string | undefined,
material?: string | undefined,
gender?: string | undefined,
country?: string | undefined,
}

export interface GetProductsWhereRequest {
id?: string | undefined,
status?: GetProductsWhereRequest_ProductStatusEnum | undefined,
companyId?: string | undefined,
isSale?: boolean | undefined,
isTop?: boolean | undefined,
isPreorder?: boolean | undefined,
image?: string | undefined,
minAge?: number | undefined,
length?: string | undefined,
weight?: string | undefined,
width?: string | undefined,
height?: string | undefined,
}

export enum GetProductsWhereRequest_ProductStatusEnum {
ACTIVE = 0,
INACTIVE = 1,
PENDING = 2,
ARCHIVED = 3,
UNRECOGNIZED = -1,
}

export interface GetAllProductsRequest {
brandId: boolean,
categories: boolean,
variants: boolean,
characteristics: boolean,
where: GetProductsWhereRequest | undefined,
page?: number | undefined,
pagesize?: number | undefined,
}

export interface GetAllProductsResponse {
data: Product[],
page?: number | undefined,
total?: number | undefined,
}

export interface GetOneProductRequest {
id: string,
brandId: boolean,
categories: boolean,
variants: boolean,
characteristics: boolean,
}

export interface GetOneProductResponse {
data: Product | undefined,
}

export interface GetCategoriesResponse {
data: Category[],
page?: number | undefined,
total?: number | undefined,
}

export interface GetCategoriesRequest {
variantFields: boolean,
variantValues: boolean,
where: GetCategoriesWhereRequest | undefined,
pagesize?: number | undefined,
page?: number | undefined,
}

export interface GetCategoriesWhereRequest {
id?: string | undefined,
status?: GetCategoriesWhereRequest_CategoryStatusEnum | undefined,
image?: string | undefined,
icon?: string | undefined,
length?: string | undefined,
weight?: string | undefined,
width?: string | undefined,
height?: string | undefined,
parentId?: string | undefined,
}

export enum GetCategoriesWhereRequest_CategoryStatusEnum {
ACTIVE = 0,
INACTIVE = 1,
UNRECOGNIZED = -1,
}

export interface GetCategoryRequest {
id: string,
variantFields: boolean,
variantValues: boolean,
}

export interface GetCategoryResponse {
data: Category | undefined,
}

export interface AddNewCategoryRequest {
status: AddNewCategoryRequest_CategoryStatusEnum,
image: string,
length: string,
weight: string,
parentId?: string | undefined,
width: string,
height: string,
/** CategoryTranslations translation = 8; */
translation: {[key: string]: any} | undefined,
rating?: number,
}

export enum AddNewCategoryRequest_CategoryStatusEnum {
ACTIVE = 0,
INACTIVE = 1,
UNRECOGNIZED = -1,
}

export interface AddNewCategoryResponse {
data?: Category | undefined,
}

export interface UpdateCategoryRequest {
/**
 * string id = 1;
 *  Category data = 2;
 */
id: string,
status: UpdateCategoryRequest_CategoryStatusEnum,
image: string,
length: string,
weight: string,
width: string,
height: string,
parentId?: string | undefined,
/** CategoryTranslations translation = 8; */
translation: {[key: string]: any} | undefined,
}

export enum UpdateCategoryRequest_CategoryStatusEnum {
ACTIVE = 0,
INACTIVE = 1,
UNRECOGNIZED = -1,
}

export interface UpdateCategoryResponse {
data: Category | undefined,
}

export interface UpdateStatusCategoryRequest {
id: string,
status: string,
}

/** optional Category data = 1; */
export interface UpdateStatusCategoryResponse {
}

export interface GetAllBrandsReq {
query?: QueryCategories | undefined,
lang?: string | undefined,
page?: number | undefined,
pagesize?: number | undefined,
}

export interface GetAllBrandsRes {
data: Brand[],
page?: number | undefined,
total?: number | undefined,
}

export interface GetOneBrandReq {
id: string,
lang?: string | undefined,
}

export interface GetOneBrandRes {
data: Brand | undefined,
}

export interface AddNewBrandReq {
data: Brand | undefined,
}

export interface AddNewBrandRes {
data?: Brand | undefined,
}

export interface UpdateBrandReq {
id: string,
data: Brand | undefined,
}

export interface UpdateBrandRes {
data: Brand | undefined,
}

export interface UpdateStatusBrandRes {
data?: Brand | undefined,
}

export interface UpdateStatusBrandReq {
id: string,
status: string,
}

export interface DeleteProductRequest {
id: string,
}

export interface DelReq {
id: string,
}

export interface DelRes {
result: string,
errors: string[],
}

export interface DeleteOneResponse {
acknowledged: boolean,
deletedCount: number,
}

export interface QueryCategories {
status?: string | undefined,
}

export interface QueryBrand {
status?: string | undefined,
}

export interface Translate {
uz: string,
ru: string,
en: string,
}

export interface Category {
id?: string | undefined,
status: string,
image: string,
icon: string,
length: string,
weight: string,
width: string,
height: string,
parentId: string,
translation: {[key: string]: any} | undefined,
name?: string | undefined,
description?: string | undefined,
createdAt?: string | undefined,
updatedAt?: string | undefined,
slug?: string | undefined,
}

export interface Brand {
id?: string | undefined,
status: string,
image: string,
name?: string | undefined,
description?: string | undefined,
createdAt?: string | undefined,
updatedAt?: string | undefined,
slug?: string | undefined,
/** optional BrandTranslation translation = 8; */
translation?: {[key: string]: any} | undefined,
}

export interface VariantField {
id?: string | undefined,
ord: string,
type: string,
slug: string,
/** optional VariantFieldTranslation translation = 6; */
translation?: {[key: string]: any} | undefined,
categories: Category[],
variantValues: VariantValue[],
value?: string | undefined,
createdAt?: string | undefined,
updatedAt?: string | undefined,
name?: string | undefined,
}

export interface VariantValue {
id?: string | undefined,
variantField?: VariantField | undefined,
variants: Variant[],
value?: string | undefined,
createdAt?: string | undefined,
updatedAt?: string | undefined,
}

export interface Variant {
id?: string | undefined,
/** optional Product product = 2; */
productId?: string | undefined,
status?: string | undefined,
companyId: number,
price: number,
quantity: number,
reservedQuantity: number,
extId: string,
length: string,
weight: string,
width: string,
height: string,
variantPhotos: VariantPhoto[],
createdAt?: string | undefined,
updatedAt?: string | undefined,
values?: variantValues | undefined,
/** repeated VariantField variantValues = 16; */
warehouses: Warehouse[],
variants: Variant[],
sku: string,
}

export enum Variant_VariantStatus {
ACTIVE = 0,
INACTIVE = 1,
UNRECOGNIZED = -1,
}

export interface Warehouse {
id: string,
name: string,
quantity: number,
}

export interface RepeatedVariantValue {
variantValue: VariantField[],
status: string,
warehouseId: number,
companyId: number,
price: number,
quantity: number,
reservedQuantity: number,
extId: string,
length: string,
weight: string,
width: string,
height: string,
createdAt?: string | undefined,
updatedAt?: string | undefined,
}

export interface Characteristic {
id?: string | undefined,
status: Characteristic_CharacteristicStatus,
product?: Product | undefined,
group?: CharacteristicGroup | undefined,
createdAt?: string | undefined,
updatedAt?: string | undefined,
}

export enum Characteristic_CharacteristicStatus {
ACTIVE = 0,
INACTIVE = 1,
PENDING = 2,
ARCHIVED = 3,
UNRECOGNIZED = -1,
}

export interface CharacteristicGroup {
id?: string | undefined,
createdAt?: string | undefined,
updatedAt?: string | undefined,
products: Product[],
characteristics: Characteristic[],
categories: Category[],
name?: string | undefined,
}

export interface Product {
id?: string | undefined,
status: string,
/** optional Brand brandId = 3; */
brandId: string,
categories: Category[],
variants: Variant[],
characteristics: Characteristic[],
companyId: string,
isSale: boolean,
isTop: boolean,
isPreorder: boolean,
image: string,
minAge: number,
length: string,
weight: string,
width: string,
height: string,
name?: string | undefined,
description?: string | undefined,
content?: string | undefined,
createdAt?: string | undefined,
updatedAt?: string | undefined,
translation: {[key: string]: any} | undefined,
/** google.protobuf.Struct variantFields = 23; */
rating: number,
categoryId: string,
slug: string,
material?: string | undefined,
gender?: string | undefined,
country?: string | undefined,
group?: VariantGroupProduct | undefined,
}

export interface VariantGroup {
id?: string | undefined,
variants: string[],
images: VariantGroupImages[],
productId: string,
createdAt?: string | undefined,
updatedAt?: string | undefined,
sku?: string | undefined,
slug?: string | undefined,
}

export interface VariantGroupProduct {
id?: string | undefined,
variants: string[],
images: VariantGroupImages[],
productId: string,
createdAt?: string | undefined,
updatedAt?: string | undefined,
sku?: string | undefined,
slug?: string | undefined,
}

export interface VariantGroupSlug {
id?: string | undefined,
variants: Variant[],
images: VariantGroupImages[],
productId: Product | undefined,
createdAt?: string | undefined,
updatedAt?: string | undefined,
sku?: string | undefined,
slug?: string | undefined,
}

export interface VariantGroupImages {
id: string,
image: string,
}

export interface CategoryDetails {
  id: string,
  status: string,
  image: string,
  name: string,
  slug: string,
}

export interface GetProductVariant {
  groupId: string,
  id: string,
  price: number,
  quantity: number,
  value: string,
  weight: string,
  priceWithDiscount: number | null
}

export interface GetProductVariantGroup {
  field: string,
  value: string,
  variantGroupId: string,
  variantGroupSlug: string,
  variants: GetProductVariant[]
}

export interface GetProductDetails {
  images: {
    variantGroupId: string,
    url: string
  }[],
  variantGroupId: string,
  variants: GetProductVariantGroup[],
  product: {
    id: string,
    status: string,
    categoryId: string,
    name: string,
    companyId: string,
    isSale: boolean,
    isTop: boolean,
    isPreorder: boolean,
    image: string,
    minAge: number,
    length: string,
    weight: string,
    width: string,
    height: string,
    description: string,
    content: string,
    rating: number,
    material: string,
    gender: string,
    country: string,
    categories: CategoryDetails[],
    category: CategoryDetails,
    brand: {
      id: string,
      status: string,
      image: string,
      name: string,
      description: string,
      slug: string
    }
  }
}

export interface VariantService {
GetVariantGroupByProductId(request: GetVGReq): Promise<GetVGRes>;
GetVariantGroups(request: GetVGReq): Promise<VariantGroupsResponse>;
SetVariantGroupImages(request: VariantGroupsSetImageRequest): Promise<VariantGroupsResponse>;
AddImage(request: AddVPReq): Promise<AddVPRes>;
UpdateImage(request: UpdateVPReq): Promise<AddVPRes>;
RemoveImage(request: DelVPReq): Promise<AddVPRes>;
GetProductVariant(request: GetProductVariantReq): Promise<GetProductVariantRes>;
GetAll(request: GetAllVariantReq): Promise<GetAllVariantRes>;
GetOne(request: GetOneVariantReq): Promise<GetOneProductResponse>;
GetProductByVariantId(request: GetProductByVariantIdReq): Promise<GetProductByVariantIdRes>;
AddNew(request: AddNewVariantReq): Promise<AddNewVariantRes>;
VariantAdd(request: VariantCreate): Promise<AddNewVariantRes>;
Update(request: UpdateVariantReq): Promise<UpdateVariantRes>;
UpdateStatus(request: UpdateStatusVariantReq): Promise<UpdateStatusVariantRes>;
Delete(request: DelReq): Promise<DelReq>;
GetVariantGroup(request: GetVariantGroupRequest): Promise<GetVariantGroupResponse>;
GetProductsForVariants(request: string[]): Promise<GetVariantGroupResponse>;
}

export interface ProductService {
GetAll(request: GetAllProductsRequest): Promise<GetAllProductsResponse>;
GetOne(request: GetOneProductRequest): Promise<GetOneProductResponse>;
Create(request: CreateProductRequest): Promise<CreateProductResponse>;
Delete(request: DeleteProductRequest): Promise<DeleteOneResponse>;
Update(request: UpdateProductRequest): Promise<CreateProductResponse>;
}

export interface VariantValueService {
GetAll(request: GetAllVVReq): Promise<GetAllVVRes>;
GetOne(request: GetAllVVReq): Promise<GetOneVVRes>;
AddNew(request: CreateVVReq): Promise<GetOneVVRes>;
Delete(request: DeleteProductRequest): Promise<DeleteOneResponse>;
Update(request: UpdateVVReq): Promise<GetOneVVRes>;
}

export interface BrandService {
GetAll(request: GetAllBrandsReq): Promise<GetAllBrandsRes>;
GetOne(request: GetOneBrandReq): Promise<GetOneBrandRes>;
AddNew(request: AddNewBrandReq): Promise<AddNewBrandRes>;
Update(request: UpdateBrandReq): Promise<UpdateBrandRes>;
UpdateStatus(request: UpdateStatusBrandReq): Promise<UpdateStatusBrandRes>;
Delete(request: DelReq): Promise<DelRes>;
}

export interface VariantFieldService {
GetAll(request: GetAllVariantFieldReq): Promise<GetAllVariantFieldRes>;
GetOne(request: GetOneVariantFieldReq): Promise<GetOneVariantFieldRes>;
AddNew(request: CreateVFReq): Promise<GetOneVariantFieldRes>;
Delete(request: DeleteProductRequest): Promise<DeleteOneResponse>;
Update(request: UpdateVFReq): Promise<GetOneVariantFieldRes>;
}

export interface CharacteristicService {
GetAll(request: GetAllCharReq): Promise<GetAllCharRes>;
GetOne(request: GetAllCharReq): Promise<GetOneCharFieldRes>;
Create(request: CreateVFReq): Promise<GetOneCharFieldRes>;
Delete(request: DeleteProductRequest): Promise<DeleteOneResponse>;
Update(request: UpdateCharReq): Promise<GetOneCharFieldRes>;
}

export interface CategoryService {
GetCategories(request: GetCategoriesRequest): Promise<GetCategoriesResponse>;
GetCategory(request: GetCategoryRequest): Promise<GetCategoryResponse>;
GetTreeCategory(request: GetTreeCategoryReq): Promise<GetTreeCategoryRes>;
AddNew(request: AddNewCategoryRequest): Promise<AddNewCategoryResponse>;
Update(request: UpdateCategoryRequest): Promise<UpdateCategoryResponse>;
UpdateStatus(request: UpdateStatusCategoryRequest): Promise<UpdateStatusCategoryResponse>;
Delete(request: DelReq): Promise<DelRes>;
}

export interface CharacteristicGroupService {
GetAll(request: GetAllChGReq): Promise<GetAllChGRes>;
GetOne(request: GetAllChGReq): Promise<GetOneChGRes>;
AddNew(request: CreateChGReq): Promise<GetOneChGRes>;
Delete(request: DeleteProductRequest): Promise<DeleteOneResponse>;
Update(request: UpdateChGReq): Promise<GetOneChGRes>;
}

export interface DbCleanerService {
DbClean(request: EmptyReq): Promise<DelRes>;
}





































