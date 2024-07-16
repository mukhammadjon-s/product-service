import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Category } from './category.schema';
import { VariantValue } from './variantValues.schema';

@Schema({ timestamps: true })
export class VariantField {
  // @Prop({
  //   type: [
  //     {
  //       type: mongoose.Schema.Types.ObjectId,
  //       ref: 'Category',
  //     },
  //   ],
  // })
  // categories: Category[];
  // @Prop({
  //   type: [
  //     {
  //       type: mongoose.Schema.Types.ObjectId,
  //       ref: 'VariantValue',
  //     },
  //   ],
  // })
  // variantValues: VariantValue[];
  @Prop({ type: String, required: false })
  ord: string;
  @Prop({ type: String, required: true })
  type: string;
  @Prop({ type: String, required: true })
  slug: string;
  @Prop({ type: Object, required: true })
  translation: {
    [key: string]: { name: string };
  };
}

export type VariantFieldDocument = VariantField & Document;
export const VariantFieldSchema = SchemaFactory.createForClass(VariantField);
// export type VariantFieldModel = mongoose.Model<VariantField>;
export interface VariantFieldModel extends mongoose.Model<VariantField> {
  findTranslated(
    filter: mongoose.FilterQuery<VariantField>,
    projection: mongoose.ProjectionType<VariantField>,
    options: mongoose.QueryOptions<VariantField> & { lang: LanguageTypes },
  ): Promise<VariantField[]>;
  findByIdTranslated(
    id: mongoose.Types.ObjectId | string,
    projection: mongoose.ProjectionType<VariantField>,
    options: mongoose.QueryOptions<VariantField> & { lang: LanguageTypes },
  ): Promise<VariantField>;
}

VariantFieldSchema.statics.findTranslated = async function (
  filter,
  projection,
  options,
) {
  const lang = options?.lang || process.env.DEFAULT_LANG;
  const data = await this.find(filter, projection, {
    ...options,
    populate: options?.populate?.map?.((key) => ({
      path: key,
      transform: (doc) => {
        const data = JSON.parse(JSON.stringify(doc));
        return {
          ...data,
          ...(data?.translation && data.translation[lang]
            ? data.translation[lang]
            : {}),
          id: data?._id,
          translation: undefined,
        };
      },
    })),
  });
  const result = data.map(({ _doc: item }) => ({
    ...item,
    ...(item.translation && item.translation[lang]
      ? item.translation[lang]
      : {}),
    id: item._id,
    translation: undefined,
  }));
  return result;
};

VariantFieldSchema.statics.findByIdTranslated = async function (
  id,
  projection,
  options,
) {
  const lang = options?.lang || process.env.DEFAULT_LANG;
  const data = await this.findById(id, projection, {
    ...options,
    populate: options?.populate?.map?.((key) => ({
      path: key,
      transform: (doc) => {
        const data = JSON.parse(JSON.stringify(doc));
        return {
          ...data,
          ...(data?.translation && data.translation[lang]
            ? data.translation[lang]
            : {}),
          id: data._id,
          translation: undefined,
        };
      },
    })),
  });
  Object.assign(data, {
    ...(data?.translation && data.translation[lang]
      ? data?.translation[lang]
      : {}),
    id: data?._id,
  });
  delete data.translation;
  return data;
};
