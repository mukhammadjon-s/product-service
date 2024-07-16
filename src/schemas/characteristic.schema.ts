import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Product } from './product.schema';
import { CharacteristicGroup } from './characteristicGroup.schema';

export enum CharacteristicStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  ARCHIVED = 'ARCHIVED',
}

@Schema({ timestamps: true })
export class Characteristic {
  @Prop({ type: String, enum: CharacteristicStatus, required: false })
  status: CharacteristicStatus;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
  product: Product;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'CharacteristicGroup' })
  group: CharacteristicGroup;
}

export type CharacteristicDocument = Characteristic & Document;
export const CharacteristicSchema =
  SchemaFactory.createForClass(Characteristic);
// export type CharacteristicModel = mongoose.Model<Characteristic>;
export interface CharacteristicModel extends mongoose.Model<Characteristic> {
  findTranslated(
    filter: mongoose.FilterQuery<Characteristic>,
    projection: mongoose.ProjectionType<Characteristic>,
    options: mongoose.QueryOptions<Characteristic> & { lang: LanguageTypes },
  ): Promise<Characteristic[]>;
  findByIdTranslated(
    id: mongoose.Types.ObjectId | string,
    projection: mongoose.ProjectionType<Characteristic>,
    options: mongoose.QueryOptions<Characteristic> & { lang: LanguageTypes },
  ): Promise<Characteristic>;
}

CharacteristicSchema.statics.findTranslated = async function (
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
          translation: undefined,
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
    translation: undefined,
  }));
  return result;
};

CharacteristicSchema.statics.findByIdTranslated = async function (
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
