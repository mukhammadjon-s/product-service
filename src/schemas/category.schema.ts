import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { VariantField } from './variantFields.schema';
import { VariantValue } from './variantValues.schema';
import { CharacteristicGroup } from './characteristicGroup.schema';
import { RegexSlug, Transliterate } from "shared/helper";

export enum StatusCategory {
  DEFAULT = 'DEFAULT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Schema({ timestamps: true })
export class Category {
  @Prop({
    type: String,
    enum: StatusCategory,
    required: false,
    default: StatusCategory.ACTIVE,
  })
  status: StatusCategory;
  @Prop({ type: String, required: false })
  image: string;
  @Prop({ type: String, required: false })
  icon: string;
  @Prop({ type: String, required: false })
  length: string;
  @Prop({ type: String, required: false, default: null })
  parentId: string;
  @Prop({ type: String, required: false })
  weight: string;
  @Prop({ type: String, required: false })
  width: string;
  @Prop({ type: String, required: false })
  height: string;
  @Prop({ type: Number, required: false })
  rating: number;
  @Prop({ type: String, required: false, unique: true })
  slug: string;
  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VariantField',
      },
    ],
  })
  variantFields: VariantField[];
  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VariantValue',
      },
    ],
  })
  variantValues: VariantValue[];
  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CharacteristicGroup',
      },
    ],
  })
  characteristicGroups: CharacteristicGroup[];
  @Prop({ type: Object, required: false })
  translation: {
    [key: string]: { name: string; description: string };
  };
}
export type CategoryDocument = Category & Document;
export const CategorySchema = SchemaFactory.createForClass(Category);
export interface CategoryModel extends mongoose.Model<Category> {
  findTranslated(
    filter: mongoose.FilterQuery<Category>,
    projection: mongoose.ProjectionType<Category>,
    options: mongoose.QueryOptions<Category> & { lang: LanguageTypes },
  ): Promise<any>;
  findByIdTranslated(
    id: mongoose.Types.ObjectId | string,
    projection: mongoose.ProjectionType<Category>,
    options: mongoose.QueryOptions<Category> & { lang: LanguageTypes },
  ): Promise<Category>;
}

CategorySchema.statics.findTranslated = async function (
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
          // ...data,
          // ...(data.translation && data.translation[lang]
          //   ? data.translation[lang]
          //   : {}),
          // id: data._id,
          // translation: undefined,
        };
      },
    })),
  });
  const result = data.map(({ _doc: item }) => {
    return {
      ...item,
      ...(data.translation && data.translation[lang]
        ? data.translation[lang]
        : {}),
      id: item._id,
      // translation: undefined,
    };
  });
  return result;
};

CategorySchema.statics.findByIdTranslated = async function (
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
          ...(data.translation && data.translation[lang]
            ? data.translation[lang]
            : {}),
          id: data._id,
          // translation: undefined,
        };
      },
    })),
  });
  Object.assign(data, {
    ...(data.translation && data.translation[lang]
      ? data.translation[lang]
      : {}),
    id: data._id,
  });
  // delete data.translation;
  return data;
};

// CategorySchema.pre("save",())

CategorySchema.pre('save', async function (next) {
  let slug = "";
  let counter = 0;
  if (this.translation?.en?.name) {
    slug = this.translation?.en?.name?.replace(/\s+/g, "-").toLowerCase();
  } else if (this.translation?.ru?.name) {
    slug = this.translation?.ru?.name?.replace(/\s+/g, "-").toLowerCase();
  } else if (this.translation?.uz?.name) {
    slug = this.translation?.uz?.name?.replace(/\s+/g, "-").toLowerCase();
  }
  slug = RegexSlug(Transliterate(slug));

  const checkSlug = async (searchSlug, searchCounter) => {
    const element = await this.$model(Category.name).findOne({ slug: counter > 0 ? `${searchSlug}-${searchCounter}` : searchSlug });
    if (element) {
      counter += 1;
      await checkSlug(searchSlug, counter);
    } else {
      slug = counter > 0 ? `${searchSlug}-${counter}` : searchSlug;
    }
  };
  await checkSlug(slug, counter);
  this.slug = slug;
  next();
});
