import * as dotenv from 'dotenv';
dotenv.config();

import Typesense from 'typesense';
import { ConfigurationOptions } from 'typesense/lib/Typesense/Configuration';
import { ProductSchema } from '../../../shared/typesense/schemas/product.typesense.schema';

module.exports = (async () => {
  try {
    const TYPESENSE_CONFIG: ConfigurationOptions = {
      nodes: [
        {
          host: process.env.TYPESENSE_CLIENT_HOST,
          port: +process.env.TYPESENSE_CLIENT_PORT,
          protocol: process.env.TYPESENSE_CLIENT_PROTOCOL,
        },
      ],
      apiKey: process.env.TYPESENSE_CLIENT_API_KEY,
    };

    console.log('Config: ', TYPESENSE_CONFIG);

    const typesense = new Typesense.Client(TYPESENSE_CONFIG);

    try {
      const languages = process.env.TYPESENSE_LANGUAGES.split(',').map((lang) =>
        lang.trim(),
      );

      for (let i = 0; i < languages.length; i++) {
        const collectionName = `${ProductSchema.name}_${languages[i]}`;
        const newProductSchema = {
          ...ProductSchema,
          ...{ name: collectionName },
        };
        try {
          await typesense.collections(collectionName).retrieve();
          if (process.argv[2] === '--delete') {
            console.log('Removing collection and generating schema again');
            await typesense.collections(collectionName).delete();
            await typesense.collections().create(newProductSchema);
          } else {
            console.log('Collection already exists');
          }
        } catch (err) {
          console.log(
            'Creating Schema',
            JSON.stringify(newProductSchema, null, 2),
          );
          await typesense.collections().create(newProductSchema);
        }
      }
    } catch (err) {
      console.error('Error - ', err);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
