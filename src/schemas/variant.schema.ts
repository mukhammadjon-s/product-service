import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import { Product } from "./product.schema";
import { VariantGroup } from "./variantGroup.schema";
import * as _ from "lodash";
import { getField } from "../../shared/utils";
import { makeId, RegexSlug, Transliterate } from "shared/helper";

export enum VariantStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

@Schema({ timestamps: true })
export class Variant {
  @Prop({
    type: String,
    enum: VariantStatus,
    required: false,
    default: VariantStatus.ACTIVE
  })
  status: VariantStatus;
  // @Prop({ type: Number, required: false })
  // warehouseId: number;
  @Prop({ type: Number, required: false })
  companyId: number;
  @Prop({ type: Number, required: false })
  price: number;
  @Prop({ type: Number, required: false })
  quantity: number;
  @Prop({ type: Number, required: false })
  reservedQuantity: number;
  @Prop({ type: String, required: false })
  extId: string;
  @Prop({ type: String, required: false })
  length: string;
  @Prop({ type: String, required: false })
  weight: string;
  @Prop({ type: String, required: false })
  width: string;
  @Prop({ type: String, required: false })
  height: string;
  @Prop({ type: String, required: false })
  barcode: string;
  @Prop({ type: Number, required: false })
  discountPercentage: number;
  @Prop([{ type: Object, required: false }])
  warehouses: {
    id: {
      type: string;
    };
    name: {
      type: string;
    };
    quantity: {
      type: number;
    };
  };
  @Prop({
    type: Object,
    required: false
  })
  values: {
    translation: {
      type: {
        [key: string]: [
          {
            type: {
              value: string;
              field: string;
              slug: string;
            };
          },
        ];
      };
    };
    ord: {
      type: string;
      required: false;
    };
    type: {
      type: string;
      required: false;
    };
    slug: {
      type: string;
      required: false;
      unique: true;
    };
  };
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  })
  productId: Product;
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: "VariantGroup"
  })
  variantGroupId: VariantGroup;
  @Prop({ type: Array, required: false })
  variantPhotos: { id: string; image: string };

  @Prop({ type: String, required: false, default: "color" })
  mainField: string;

  @Prop({ type: Number })
  variantItemId: number;

  @Prop({ type: String, required: false })
  typesenseObjectId: string;

  @Prop({ type: Number, required: false })
  rating: number;

  @Prop({ type: Number, required: false })
  billzId: number;
}

export type VariantDocument = Variant & Document;
export const VariantSchema = SchemaFactory.createForClass(Variant);

export interface VariantModel extends mongoose.Model<Variant> {
  findTranslated(
    filter: mongoose.FilterQuery<Variant>,
    projection: mongoose.ProjectionType<Variant>,
    options: mongoose.QueryOptions<Variant>
  ): Promise<Variant[]>;

  findByIdTranslated(
    id: mongoose.Types.ObjectId | string,
    projection: mongoose.ProjectionType<Variant>,
    options: mongoose.QueryOptions<Variant> & { lang: LanguageTypes }
  ): Promise<Variant>;
}

VariantSchema.statics.findTranslated = async function (
  filter,
  projection,
  options
) {
  const data = await this.find(filter, projection, {
    ...options,
    populate: options?.populate?.map?.((key) => ({
      path: key,
      strictPopulate: false,
      transform: (doc) => {
        const data = JSON.parse(JSON.stringify(doc));
        return {
          ...data,
          id: data._id
        };
      }
    }))
  });
  const result = data.map(({ _doc: item }) => ({
    ...item,
    id: item._id
  }));
  return result;
};

VariantSchema.statics.findByIdTranslated = async function (
  id,
  projection,
  options
) {
  const data = await this.findById(id, projection, {
    ...options,
    populate: options?.populate?.map?.((key) => ({
      path: key,
      transform: (doc) => {
        const data = JSON.parse(JSON.stringify(doc));
        return {
          ...data,
          id: data._id
        };
      }
    }))
  });
  Object.assign(data, {
    id: data._id
  });
  return data;
};

/** Depricated: Logic not quite right */
/** We must groupBy some field, but it's not considered here */
// VariantSchema.pre("save", async function(next) {
//   try {
//     const mainField = this.mainField;
//     const id = this._id;
//     const value = [];
//     const arr = getField(this.values.translation, "ru");
//     arr.map((e) => {
//       if (e.slug === mainField) {
//         if (value.indexOf(e.value) === -1) {
//           value.push(Transliterate(e.value).toLowerCase());
//         }
//       }
//     });
//     if (value.length === 0) {
//       const newSlug =
//         arr[Math.floor(Math.random() * (arr.ru?.length + 1) + 0)].slug;
//       arr.map((e) => {
//         if (e.slug === newSlug) {
//           if (value.indexOf(e.value) === -1) {
//             value.push(Transliterate(e.value).toLowerCase());
//           }
//         }
//       });
//     }
//     const a = this.$model(VariantGroup.name);
//     const product = await this.$model(Product.name).findById(this.productId);
//     Promise.all(
//       value.map(async (item) => {
//         const variantGroup = await a.findOne({
//           productId: this.productId,
//           name: item
//         });

//         if (variantGroup) {
//           await a.findByIdAndUpdate(variantGroup.id, {
//             variants: _.uniq([
//               ...getField(variantGroup, "variants"),
//               id.toString()
//             ])
//           });
//         } else {
//           let counter = 0;
//           let slug =
//             (getField(product, "translation")?.ru?.name || "") + "-" + item;
//           const checkSlug = async (searchSlug) => {
//             const isHave = await a.findOne({ slug: counter > 0 ? `${searchSlug}-${counter}` : searchSlug });
//             if (isHave) {
//               counter++;
//             } else {
//               slug = counter > 0 ? `${searchSlug}-${counter}` : searchSlug;
//             }
//           };
//           await checkSlug(slug);
//           await a.create({
//             productId: this.productId.toString(),
//             variants: [id.toString()],
//             name: item,
//             slug: RegexSlug(slug),
//             images: []
//           });
//         }
//       })
//     );
//   } catch (e) {
//   }
//   next();
// });
