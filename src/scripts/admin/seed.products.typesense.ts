import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

import Typesense from 'typesense';
import { ConfigurationOptions } from 'typesense/lib/Typesense/Configuration';
import { IProductToIndex } from './interfaces/product.interface';
import { ProductSchema } from '../../../shared/typesense/schemas/product.typesense.schema';

const defineModels = () => {
  mongoose.model('variants', new mongoose.Schema({}), 'variants');
  mongoose.model('categories', new mongoose.Schema({}), 'categories');
  mongoose.model('brands', new mongoose.Schema({}), 'brands');

  const ProductModel = mongoose.model(
    'products',
    new mongoose.Schema({
      variants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'variants' }],
      brand: { type: mongoose.Schema.Types.ObjectId, ref: 'brands' },
      categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'categories' }],
    }),
    'products',
  );

  return {
    ProductModel,
  };
};

module.exports = (async () => {
  try {
    const TYPESENSE_CONFIG: ConfigurationOptions = {
      nodes: [
        {
          host: process.env.TYPESENSE_HOST,
          port: +process.env.TYPESENSE_PORT,
          protocol: process.env.TYPESENSE_PROTOCOL,
        },
      ],
      apiKey: process.env.TYPESENSE_ADMIN_API_KEY,
    };

    console.log('Config: ', TYPESENSE_CONFIG);

    const typesense = new Typesense.Client(TYPESENSE_CONFIG);

    try {
      const collection = await typesense
        .collections(ProductSchema.name)
        .retrieve();

      console.log(
        'Found the collection',
        collection.name,
        collection.num_documents,
      );
    } catch (err) {
      console.log('Creating schema...', JSON.stringify(ProductSchema, null, 2));
      await typesense.collections().create(ProductSchema);
    }

    await mongoose.connect('mongodb://localhost:27017/products');

    const { ProductModel } = defineModels();

    console.log('Reading data from database');

    const productsCount = await ProductModel.count();
    let currentCount = 0;
    let currentPage = 0;
    const perPage = 10; // change this from 10 to kind og 500 or 1000

    while (currentCount <= productsCount) {
      console.log('Running page...', currentPage, productsCount);

      const products = await ProductModel.find()
        .skip(currentCount)
        .limit(perPage)
        .populate(['categories', 'variants', 'brand']);

      const productsToIndex = products.flatMap((product: any) => {
        if (product.variants?.length > 0) {
          console.log('Found variant for the product', product.variants.length);
          return product.variants.map((variant: any): IProductToIndex => {
            // add more details here, complete the model to be populated.
            return {
              item_id: variant.item_id,
              product_id: product._id.toString(),
              sku: variant.sku,
              slug: variant.slug,
              category_slug: undefined,
              category_slugs: undefined,
              name: undefined,
              mini_desc: undefined,
              image: undefined,
              is_top: undefined,
              category: undefined,
              brand: undefined,
              brand_slug: undefined,
              brand_id: undefined,
              category_id: undefined,
              colors: undefined,
              prices: undefined,
              materials: undefined,
              sizes: undefined,
            };
          });
        } else {
          return {};
        }
      });

      // add products to typesense
      await typesense
        .collections(ProductSchema.name)
        .documents()
        .create(productsToIndex, { action: 'upsert' });

      // update page index
      currentPage++;
      currentCount = currentPage * perPage;
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
