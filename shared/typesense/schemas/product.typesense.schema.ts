import { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';

export const ProductSchema: CollectionCreateSchema = {
  name: 'products',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'colors', type: 'string[]', optional: true },
    { name: 'brand', type: 'string' },
    { name: 'brand_id', type: 'string', optional: true },
    { name: 'brand_slug', type: 'string', optional: true },
    { name: 'category', type: 'string', optional: true },
    { name: 'category_id', type: 'string', optional: true },
    { name: 'category_slug', type: 'string', optional: true },
    { name: 'category_slugs', type: 'string[]', optional: true },
    { name: 'image', type: 'string', optional: true },
    { name: 'is_top', type: 'bool', facet: true, optional: true },
    { name: 'material', type: 'string', optional: true },
    { name: 'merchantId', type: 'string', optional: true },
    { name: 'merchantName', type: 'string', optional: true },
    { name: 'mini_desc', type: 'string', optional: true },
    { name: 'name', type: 'string', optional: true },
    { name: 'content', type: 'string', optional: true },
    { name: 'description', type: 'string', optional: true },
    { name: 'prices', type: 'float[]', facet: true, optional: true },
    { name: 'product_id', type: 'string', facet: true },
    { name: 'rating', type: 'int32', facet: true, optional: true },
    { name: 'sizes', type: 'string[]', facet: true, optional: true },
    { name: 'variant_slugs', type: 'string[]', facet: true, optional: true },
    { name: 'sku', type: 'string', facet: true, optional: true },
    { name: 'item_id', type: 'int32', facet: true },
  ],
  default_sorting_field: 'rating',
};


// "default_sorting_field": "rating",
//   "fields": [
//   {
//     "facet": false,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "product_id",
//     "optional": false,
//     "sort": false,
//     "type": "string"
//   },
//   {
//     "facet": false,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "rating",
//     "optional": false,
//     "sort": true,
//     "type": "int32"
//   },
//   {
//     "facet": false,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "slug",
//     "optional": false,
//     "sort": false,
//     "type": "string"
//   },
//   {
//     "facet": false,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "category_slug",
//     "optional": false,
//     "sort": false,
//     "type": "string"
//   },
//   {
//     "facet": false,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "category_slugs",
//     "optional": false,
//     "sort": false,
//     "type": "string[]"
//   },
//   {
//     "facet": false,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "name",
//     "optional": false,
//     "sort": false,
//     "type": "string"
//   },
//   {
//     "facet": false,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "mini_desc",
//     "optional": true,
//     "sort": false,
//     "type": "string"
//   },
//   {
//     "facet": false,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "image",
//     "optional": true,
//     "sort": false,
//     "type": "string"
//   },
//   {
//     "facet": true,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "is_top",
//     "optional": true,
//     "sort": true,
//     "type": "bool"
//   },
//   {
//     "facet": true,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "category",
//     "optional": false,
//     "sort": false,
//     "type": "string"
//   },
//   {
//     "facet": true,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "brand",
//     "optional": false,
//     "sort": false,
//     "type": "string"
//   },
//   {
//     "facet": false,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "brand_slug",
//     "optional": false,
//     "sort": false,
//     "type": "string"
//   },
//   {
//     "facet": false,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "brand_id",
//     "optional": false,
//     "sort": false,
//     "type": "string"
//   },
//   {
//     "facet": false,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "category_id",
//     "optional": false,
//     "sort": false,
//     "type": "string"
//   },
//   {
//     "facet": true,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "status",
//     "optional": false,
//     "sort": false,
//     "type": "string"
//   },
//   {
//     "facet": true,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "colors",
//     "optional": true,
//     "sort": false,
//     "type": "string[]"
//   },
//   {
//     "facet": true,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "prices",
//     "optional": true,
//     "sort": false,
//     "type": "float[]"
//   },
//   {
//     "facet": true,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "materials",
//     "optional": true,
//     "sort": false,
//     "type": "string[]"
//   },
//   {
//     "facet": true,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "sizes",
//     "optional": true,
//     "sort": false,
//     "type": "string[]"
//   },
//   {
//     "facet": true,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "material",
//     "optional": true,
//     "sort": false,
//     "type": "string"
//   },
//   {
//     "facet": true,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "country",
//     "optional": true,
//     "sort": false,
//     "type": "string"
//   },
//   {
//     "facet": true,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "gender",
//     "optional": true,
//     "sort": false,
//     "type": "string"
//   },
// {
//   "facet": true,
//   "index": true,
//   "infix": false,
//   "locale": "",
//   "name": "company_id",
//   "optional": false,
//   "sort": false,
//   "type": "int32"
// },
//    {
//      "name":"is_published",
//      "type":"bool",
//      "optional": true
//    }
// ],
