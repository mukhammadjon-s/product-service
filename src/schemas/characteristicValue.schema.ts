import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Product } from './product.schema';
import { Characteristic } from './characteristic.schema';
import { Category } from './category.schema';
import { CharacteristicGroup } from './characteristicGroup.schema';

@Schema({ timestamps: true })
export class CharacteristicValue {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
  product: Product;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Characteristic' })
  characteristic: Characteristic;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'CharacteristicGroup' })
  group: CharacteristicGroup;
}
export type CharacteristicValueDocument = CharacteristicValue & Document;
export const CharacteristicValueSchema =
  SchemaFactory.createForClass(CharacteristicValue);
export type CharacteristicValueModel = mongoose.Model<CharacteristicValue>;
