// export const VariantGroupsSchema = {
//   name: 'variant_groups',
//   fields: [
//     {
//       facet: false,
//       index: true,
//       infix: false,
//       locale: "",
//       name: "product_id",
//       optional: false,
//       sort: false,
//       type: "string"
//     },
//     {
//       facet: false,
//       index: true,
//       infix: false,
//       locale: "",
//       name: "status",
//       optional: false,
//       sort: false,
//       type: "string"
//     },
//     {
//       facet: false,
//       index: true,
//       infix: false,
//       locale: "",
//       name: "in_stock",
//       optional: false,
//       sort: true,
//       type: "bool"
//     },
//     {
//       facet: false,
//       index: true,
//       infix: false,
//       locale: "",
//       name: "variant_group_id",
//       optional: false,
//       sort: false,
//       type: "string"
//     },
//     {
//       facet: false,
//       index: true,
//       infix: false,
//       locale: "",
//       name: "rating",
//       optional: false,
//       sort: true,
//       type: "float"
//     },
//     {
//       facet: false,
//       index: true,
//       infix: false,
//       locale: "",
//       name: "sku",
//       optional: false,
//       sort: false,
//       type: "string"
//     },
//     {
//       facet: false,
//       index: true,
//       infix: false,
//       locale: "",
//       name: name,
//       optional: false,
//       sort: false,
//       type: "string"
//     },
//     {
//       facet: false,
//       index: true,
//       infix: false,
//       locale: "",
//       name: "slug",
//       optional: false,
//       sort: false,
//       type: "string"
//     },
//     {
//       facet: true,
//       index: true,
//       infix: false,
//       locale: "",
//       name: "category_name",
//       optional: false,
//       sort: false,
//       type: "string"
//     },
//     {
//       facet: true,
//       index: true,
//       infix: false,
//       locale: "",
//       name: "category_slug",
//       optional: false,
//       sort: false,
//       type: "string"
//     },
//     {
//       facet: true,
//       index: true,
//       infix: false,
//       locale: "",
//       name: "category_slugs",
//       optional: false,
//       sort: false,
//       type: "string[]"
//     },
//     {
//       facet: true,
//       index: true,
//       infix: false,
//       locale: "",
//       name: "category_names",
//       optional: false,
//       sort: false,
//       type: "string[]"
//     },
//     {
//       facet: false,
//       index: true,
//       infix: false,
//       locale: "",
//       name: "variant_ids",
//       optional: true,
//       sort: false,
//       type: "string[]"
//     },
//     {
//       facet: false,
//       index: true,
//       infix: false,
//       locale: "",
//       name: "mini_desc",
//       optional: false,
//       sort: false,
//       type: "string"
//     },
//     {
//       facet: false,
//       index: true,
//       infix: false,
//       locale: "",
//       name: "image",
//       optional: false,
//       sort: false,
//       type: "string"
//     },
//     {
//       facet: true,
//       index: true,
//       infix: false,
//       locale: "",
//       name: "is_top",
//       optional: false,
//       sort: true,
//       type: "bool"
//     },
//     {
//       facet: true,
//       index: true,
//       infix: false,
//       locale: "",
//       name: "brand",
//       optional: false,
//       sort: false,
//       type: "string"
//     },
//     {
//       facet: false,
//       index: true,
//       infix: false,
//       locale: "",
//       name: "brand_slug",
//       optional: false,
//       sort: false,
//       type: "string"
//     },
//     {
//       facet: true,
//       index: true,
//       infix: false,
//       locale: "",
//       name: "colors",
//       optional: false,
//       sort: false,
//       type: "string[]"
//     },
//     {
//       facet: true,
//       index: true,
//       infix: false,
//       locale: "",
//       name: "min_price",
//       optional: false,
//       sort: true,
//       type: "float"
//     },
//     {
//       facet: true,
//       index: true,
//       infix: false,
//       locale: "",
//       name: "prices",
//       optional: false,
//       sort: false,
//       type: "float[]"
//     },
//     {
//       facet: true,
//       index: true,
//       infix: false,
//       locale: "",
//       name: "material",
//       optional: false,
//       sort: false,
//       type: "string"
//     },
//     {
//       facet: true,
//       index: true,
//       infix: false,
//       locale: "",
//       name: "company_name",
//       optional: false,
//       sort: false,
//       type: "string"
//     },
//     {
//       facet: false,
//       index: true,
//       infix: false,
//       locale: "",
//       name: "company_slug",
//       optional: false,
//       sort: false,
//       type: "string"
//     },
//     {
//       facet: true,
//       index: true,
//       infix: false,
//       locale: "",
//       name: "sizes",
//       optional: false,
//       sort: false,
//       type: "string[]"
//     },
//     {
//       facet: true,
//       index: true,
//       infix: false,
//       locale: "",
//       name: "country",
//       optional: false,
//       sort: false,
//       type: "string"
//     },
//     {
//       facet: true,
//       index: true,
//       infix: false,
//       locale: "",
//       name: "gender",
//       optional: false,
//       sort: false,
//       type: "string"
//     },
//     {
//       facet: false,
//       index: true,
//       infix: false,
//       locale: "",
//       name: "images",
//       optional: true,
//       sort: false,
//       type: "string[]"
//     },
//     {
//       facet: false,
//       index: true,
//       infix: false,
//       locale: "",
//       name: "created_at",
//       optional: false,
//       sort: true,
//       type: "string"
//     },
//     {
//       facet: false,
//       index: true,
//       infix: false,
//       locale: "",
//       name: "updated_at",
//       optional: false,
//       sort: true,
//       type: "string"
//     },
//     {
//       facet: true,
//       index: true,
//       infix: false,
//       locale: "",
//       name: "popularity",
//       optional: false,
//       sort: true,
//       type: "int32"
//     },
//     {
//       facet: true,
//       index: true,
//       infix: false,
//       locale: "",
//       name: "variant_group_slug",
//       optional: false,
//       sort: false,
//       type: "string"
//     }
//   ],
//   default_sorting_field: 'rating',
// }

// "fields": [
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
//     "name": "status",
//     "optional": false,
//     "sort": false,
//     "type": "string"
//   },
//   {
//     "facet": false,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "in_stock",
//     "optional": false,
//     "sort": true,
//     "type": "bool"
//   },
//   {
//     "facet": false,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "variant_group_id",
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
//     "type": "float"
//   },
//   {
//     "facet": false,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "sku",
//     "optional": false,
//     "sort": false,
//     "type": "string"
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
//     "name": "slug",
//     "optional": false,
//     "sort": false,
//     "type": "string"
//   },
//   {
//     "facet": true,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "category_name",
//     "optional": false,
//     "sort": false,
//     "type": "string"
//   },
//   {
//     "facet": true,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "category_slug",
//     "optional": false,
//     "sort": false,
//     "type": "string"
//   },
//   {
//     "facet": true,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "category_slugs",
//     "optional": false,
//     "sort": false,
//     "type": "string[]"
//   },
//   {
//     "facet": true,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "category_names",
//     "optional": false,
//     "sort": false,
//     "type": "string[]"
//   },
//   {
//     "facet": false,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "variant_ids",
//     "optional": true,
//     "sort": false,
//     "type": "string[]"
//   },
//   {
//     "facet": false,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "mini_desc",
//     "optional": false,
//     "sort": false,
//     "type": "string"
//   },
//   {
//     "facet": false,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "image",
//     "optional": false,
//     "sort": false,
//     "type": "string"
//   },
//   {
//     "facet": true,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "is_top",
//     "optional": false,
//     "sort": true,
//     "type": "bool"
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
//     "facet": true,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "colors",
//     "optional": false,
//     "sort": false,
//     "type": "string[]"
//   },
//   {
//     "facet": true,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "min_price",
//     "optional": false,
//     "sort": true,
//     "type": "float"
//   },
//   {
//     "facet": true,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "prices",
//     "optional": false,
//     "sort": false,
//     "type": "float[]"
//   },
//   {
//     "facet": true,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "material",
//     "optional": false,
//     "sort": false,
//     "type": "string"
//   },
//   {
//     "facet": true,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "company_name",
//     "optional": false,
//     "sort": false,
//     "type": "string"
//   },
//   {
//     "facet": false,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "company_slug",
//     "optional": false,
//     "sort": false,
//     "type": "string"
//   },
//   {
//     "facet": true,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "sizes",
//     "optional": false,
//     "sort": false,
//     "type": "string[]"
//   },
//   {
//     "facet": true,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "country",
//     "optional": false,
//     "sort": false,
//     "type": "string"
//   },
//   {
//     "facet": true,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "gender",
//     "optional": false,
//     "sort": false,
//     "type": "string"
//   },
//   {
//     "facet": false,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "images",
//     "optional": true,
//     "sort": false,
//     "type": "string[]"
//   },
//   {
//     "facet": false,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "created_at",
//     "optional": false,
//     "sort": true,
//     "type": "string"
//   },
//   {
//     "facet": false,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "updated_at",
//     "optional": false,
//     "sort": true,
//     "type": "string"
//   },
//   {
//     "facet": true,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "popularity",
//     "optional": false,
//     "sort": true,
//     "type": "int32"
//   },
//   {
//     "facet": true,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "variant_group_slug",
//     "optional": false,
//     "sort": false,
//     "type": "string"
//   },
//   {
//     "facet": true,
//     "index": true,
//     "infix": false,
//     "locale": "",
//     "name": "discountPercentage",
//     "optional": true,
//     "sort": true,
//     "type": "int32"
//   },
//  {
//      "name":"is_published",
//      "type":"bool",
//      "optional": true
//    }
// ],
