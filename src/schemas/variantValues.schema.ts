import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Variant } from './variant.schema';
import { VariantField } from './variantFields.schema';

@Schema({ timestamps: true })
export class VariantValue {
  @Prop({ type: Object, required: false })
  translation: {
    [key: string]: { value: string };
  };
  @Prop({
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VariantField',
    },
  })
  variantField: VariantField;
  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Variant',
      },
    ],
  })
  variants: Variant[];
}

export type VariantValueDocument = VariantValue & Document;
export const VariantValueSchema = SchemaFactory.createForClass(VariantValue);
// export type VariantValueModel = mongoose.Model<VariantValue>;

export interface VariantValueModel extends mongoose.Model<VariantValue> {
  findTranslated(
    filter: mongoose.FilterQuery<VariantValue>,
    projection: mongoose.ProjectionType<VariantValue>,
    options: mongoose.QueryOptions<VariantValue> & { lang: LanguageTypes },
  ): Promise<VariantValue[]>;
  findByIdTranslated(
    id: mongoose.Types.ObjectId | string,
    projection: mongoose.ProjectionType<VariantValue>,
    options: mongoose.QueryOptions<VariantValue> & { lang: LanguageTypes },
  ): Promise<VariantValue>;
}

VariantValueSchema.statics.findTranslated = async function (
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
          // translation: undefined,
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
    // translation: undefined,
  }));
  return result;
};

VariantValueSchema.statics.findByIdTranslated = async function (
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
          // translation: undefined,
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
  // delete data.translation;
  return data;
};
