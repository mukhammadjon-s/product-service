import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Brand } from "./brand.schema";
import { Category } from "./category.schema";
import { Variant } from "./variant.schema";
import * as mongoose from "mongoose";
import { Characteristic } from "./characteristic.schema";
import { VariantGroup } from "./variantGroup.schema";
import { RegexSlug, Transliterate } from "shared/helper";

export enum ProductStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PENDING = "PENDING",
  ARCHIVED = "ARCHIVED",
}

@Schema({ timestamps: true })
export class Product {
  @Prop({ type: String, enum: ProductStatus, default: ProductStatus.ACTIVE })
  status: ProductStatus;
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    required: true
  })
  brand: Brand;
  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
      }
    ]
  })
  categories: Category[];
  @Prop({
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VariantGroup"
    }
  })
  variantGroupId: VariantGroup;
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  })
  category: Category;
  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Variant"
      }
    ]
  })
  variants: Variant[];
  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Characteristic"
      }
    ]
  })
  characteristics: Characteristic[];
  @Prop({ type: String, required: false })
  companyId: string;
  @Prop({ type: Boolean, required: false, default: true })
  isSale: boolean;
  @Prop({ type: Number, required: false, default: 5 })
  rating: number;
  @Prop({ type: Boolean, required: false, default: false })
  isTop: boolean;
  @Prop({ type: Boolean, required: false, default: false })
  isPreorder: boolean;
  @Prop({ type: String, required: false })
  image: string;
  @Prop({ type: Number, required: false })
  minAge: number;
  @Prop({ type: String, required: false })
  length: string;
  @Prop({ type: String, required: false })
  weight: string;
  @Prop({ type: String, required: false })
  width: string;
  @Prop({ type: String, required: false })
  height: string;
  @Prop({ type: String, required: false, unique: true })
  slug: string;
  @Prop({ type: Object, required: false })
  translation: {
    [key: string]: { name: string; description: string; content: string };
  };

  @Prop({ type: String, required: false })
  material: string;
  @Prop({ type: String, required: false })
  season: string;
  @Prop({ type: String, required: false })
  gender: string;
  @Prop({ type: String, required: false })
  country: string;
  @Prop({ type: String, required: false, default: "color" })
  mainField: string;

  @Prop({ type: Number })
  productItemId: number;

  @Prop({ type: [Number] })
  billzIds: number[];

  @Prop({ type: String, required: false })
  typesenseObjectId: string;

  @Prop({ type: Boolean, required: false, default: false })
  isPublished: boolean;
}

export type ProductDocument = Product & Document;
export const ProductSchema = SchemaFactory.createForClass(Product);

export interface ProductModel extends mongoose.Model<Product> {
  findTranslated(
    filter: mongoose.FilterQuery<Product>,
    projection: mongoose.ProjectionType<Product>,
    options: mongoose.QueryOptions<Product> & { lang: LanguageTypes }
  ): Promise<Product[]>;

  findByIdTranslated(
    id: mongoose.Types.ObjectId | string,
    projection: mongoose.ProjectionType<Product>,
    options: mongoose.QueryOptions<Product> & { lang: LanguageTypes }
  ): Promise<Product>;
}

ProductSchema.statics.findTranslated = async function(
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
          ...(data?.translation && data?.translation[lang]
            ? data.translation[lang]
            : {}),
          id: data?._id
          // translation: undefined,
        };
      }
    }))
  });
  const result = data.map(({ _doc: item }) => ({
    ...item,
    ...(item?.translation && item?.translation[lang]
      ? item?.translation[lang]
      : {}),
    id: item._id
    // translation: undefined,
  }));
  return result;
};

ProductSchema.statics.findByIdTranslated = async function(
  id,
  projection,
  options
) {
  const lang = options?.lang || process.env.DEFAULT_LANG;
  const data = await this.findById(id, projection, {
    ...options,
    populate: options?.populate?.map?.((key) => {
      let a = {};
      try {
        a =
          data?.translation && data?.translation[lang]
            ? data?.translation[lang]
            : {};
      } catch (e) {
      }
      return {
        path: key,
        transform: (doc) => {
          const data = JSON.parse(JSON.stringify(doc));
          return {
            ...data,
            ...a,
            id: data._id
            // translation:{}
            // translation: undefined,
          };
        }
      };
    })
  });
  Object.assign(data, {
    ...(data?.translation && data?.translation[lang]
      ? data?.translation[lang]
      : {}),
    id: data._id
  });
  // delete data.translation;
  return data;
};

ProductSchema.pre("save", async function(next) {
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
    const element = await this.$model(Product.name).findOne({ slug: counter > 0 ? `${searchSlug}-${searchCounter}` : searchSlug });
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
