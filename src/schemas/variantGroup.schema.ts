import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import slugify from 'slugify';
import { RegexSlug, Transliterate } from '../../shared/helper';
import { Variant } from './variant.schema';
import { Product } from './product.schema';
import { getField, getRandomArbitrary } from 'shared/utils';

const MIN_SKU = 100000000;
const MAX_SKU = 999999999;
@Schema({ timestamps: true })
export class VariantGroup {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  })
  productId: Product;

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Variant',
        required: true,
      },
    ],
  })
  variants: Variant[];

  @Prop({ type: Array, required: false })
  images: { id: string; image: string }[];

  @Prop({ type: String, required: false })
  name: string;

  @Prop({ type: Number, required: false })
  discountAmount: number;

  @Prop({ type: String, required: false, unique: true })
  slug: string;

  @Prop({ type: String, required: true })
  value: string;

  @Prop({ type: String, required: true })
  field: string;

  @Prop({
    type: String,
    required: true,
    default: () => getRandomArbitrary(MIN_SKU, MAX_SKU),
  })
  sku: string;

  @Prop({
    type: Number,
    required: true,
    default: () => 0
  })
  popularity: number;
  createdAt: string;
  updatedAt: string;

  @Prop({ type: String, required: false })
  importId: string;

  @Prop({ type: Boolean, required: false, default: false })
  isPublished: boolean;
}

export type VariantGroupDocument = VariantGroup & Document;
export const VariantGroupSchema = SchemaFactory.createForClass(VariantGroup);
export type VariantGroupModel = mongoose.Model<VariantGroup>;

VariantGroupSchema.pre("save",async function(next) {
  let slug = "";
  let counter = 0;
  const product = await this.$model(Product.name).findById(this.productId);
  const translation = getField(product, "translation");
  const mainField = getField(product, "mainField");

  if (translation?.en?.name) {
    slug = translation?.en?.name?.replace(/\s+/g, "-").toLowerCase();
  } else if (translation?.ru?.name) {
    slug = translation?.ru?.name?.replace(/\s+/g, "-").toLowerCase();
  } else if (translation?.uz?.name) {
    slug = translation?.uz?.name?.replace(/\s+/g, "-").toLowerCase();
  }

  if (mainField) {
    slug = `${slug}${slug ? '-' : ''}${mainField}`;
  }

  if (this.sku) {
    slug = `${slug}${slug ? '-' : ''}${this.sku}`;
  }

  slug = RegexSlug(Transliterate(slug));

  const checkSlug = async (searchSlug, searchCounter) => {
    const element = await this.$model(VariantGroup.name).findOne({ slug: counter > 0 ? `${searchSlug}-${searchCounter}` : searchSlug });
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

