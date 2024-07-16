import { RegexSlug, Transliterate } from "shared/helper";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import { Product } from "./product.schema";
import { Category } from "./category.schema";

export enum StatusBrand {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

@Schema({ timestamps: true })
export class Brand {
  @Prop({ type: String, required: false, default: StatusBrand.ACTIVE })
  status: StatusBrand;
  @Prop({ type: String, required: false })
  image: string;
  @Prop({ type: Object, required: false })
  translation: {
    [key: string]: { name: string; description: string };
  };
  @Prop({ type: String, required: false, unique: true })
  slug: string;
  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      }
    ]
  })
  products: Product[];
}

export type BrandDocument = Brand & Document;
export const BrandSchema = SchemaFactory.createForClass(Brand);

// export type BrandModel = mongoose.Model<Brand>;
export interface BrandModel extends mongoose.Model<Brand> {
  findTranslated(
    filter: mongoose.FilterQuery<Category>,
    projection: mongoose.ProjectionType<Category>,
    options: mongoose.QueryOptions<Category> & { lang: LanguageTypes }
  ): Promise<Category[]>;

  findByIdTranslated(
    id: mongoose.Types.ObjectId | string,
    projection: mongoose.ProjectionType<Category>,
    options: mongoose.QueryOptions<Category> & { lang: LanguageTypes }
  ): Promise<Category>;
}

BrandSchema.statics.findTranslated = async function(
  filter,
  projection,
  options
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
          ...(data.translation && data.translation[lang]
            ? data.translation[lang]
            : {}),
          id: data._id
          // translation: undefined,
        };
      }
    }))
  });
  const result = data.map(({ _doc: item }) => {
    return {
      ...item,
      ...(data.translation && data.translation[lang]
        ? data.translation[lang]
        : {}),
      id: item._id
      // translation: undefined,
    };
  });
  return result;
};

BrandSchema.statics.findByIdTranslated = async function(
  id,
  projection,
  options
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
          id: data._id
          // translation: undefined,
        };
      }
    }))
  });
  Object.assign(data, {
    ...(data?.translation && data?.translation[lang]
      ? data.translation[lang]
      : {}),
    id: data._id
  });
  // delete data.translation;
  return data;
};

BrandSchema.pre("save", async function(next) {
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
    const element = await this.$model(Brand.name).findOne({ slug: counter > 0 ? `${searchSlug}-${searchCounter}` : searchSlug });
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
