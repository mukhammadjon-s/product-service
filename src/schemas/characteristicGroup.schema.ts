import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Product } from './product.schema';
import { Characteristic } from './characteristic.schema';
import { Category } from './category.schema';

@Schema({ timestamps: true })
export class CharacteristicGroup {
  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }])
  products: Product[];
  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Characteristic' }])
  characteristics: Characteristic[];
  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }])
  categories: Category[];
  @Prop({ type: Object, required: false })
  translation: {
    [key: string]: { name: string };
  };
}
export type CharacteristicGroupDocument = CharacteristicGroup & Document;
export const CharacteristicGroupSchema =
  SchemaFactory.createForClass(CharacteristicGroup);
// export type CharacteristicGroupModel = mongoose.Model<CharacteristicGroup>;

export interface CharacteristicGroupModel
  extends mongoose.Model<CharacteristicGroup> {
  findTranslated(
    filter: mongoose.FilterQuery<CharacteristicGroup>,
    projection: mongoose.ProjectionType<CharacteristicGroup>,
    options: mongoose.QueryOptions<CharacteristicGroup> & {
      lang: LanguageTypes;
    },
  ): Promise<CharacteristicGroup[]>;
  findByIdTranslated(
    id: mongoose.Types.ObjectId | string,
    projection: mongoose.ProjectionType<CharacteristicGroup>,
    options: mongoose.QueryOptions<CharacteristicGroup> & {
      lang: LanguageTypes;
    },
  ): Promise<CharacteristicGroup>;
}

CharacteristicGroupSchema.statics.findTranslated = async function (
  filter,
  projection,
  options,
) {
  // const lang = options?.lang || process.env.DEFAULT_LANG;
  const data = await this.find(filter, projection, {
    ...options,
    populate: options?.populate?.map?.((key) => ({
      path: key,
      transform: (doc) => {
        const data = JSON.parse(JSON.stringify(doc));
        return {
          ...data,
          // ...(data?.translation && data.translation[lang]
          //   ? data.translation[lang]
          //   : {}),
          id: data?._id,
          // translation: undefined,
        };
      },
    })),
  });
  const result = data.map(({ _doc: item }) => ({
    ...item,
    // ...(item.translation && item.translation[lang]
    //   ? item.translation[lang]
    //   : {}),
    id: item._id,
    // translation: undefined,
  }));
  return result;
};

CharacteristicGroupSchema.statics.findByIdTranslated = async function (
  id,
  projection,
  options,
) {
  // const lang = options?.lang || process.env.DEFAULT_LANG;
  const data = await this.findById(id, projection, {
    ...options,
    populate: options?.populate?.map?.((key) => ({
      path: key,
      transform: (doc) => {
        const data = JSON.parse(JSON.stringify(doc));
        return {
          ...data,
          // ...(data.translation && data.translation[lang]
          //   ? data.translation[lang]
          //   : {}),
          id: data._id,
          // translation: undefined,
        };
      },
    })),
  });
  // Object.assign(data, {
  //   ...(data?.translation && data?.translation[lang]
  //     ? data?.translation[lang]
  //     : {}),
  //   id: data?._id,
  // });
  // delete data.translation;
  return data;
};
