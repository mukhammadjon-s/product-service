import mongoose from 'mongoose';
import { CleanerObjects } from '../helper/CleanerObjects';
import { structProtoToJson } from '../shared/utils';
import { RpcException } from '@nestjs/microservices';

enum ActionMapper {
  '-' = '$set',
  '=' = '$push',
}

export class BaseService<T> extends CleanerObjects {
  private references: {
    model: mongoose.Model<T>;
    id: mongoose.Schema.Types.ObjectId;
    ref: string;
    action: string;
  }[] = [];

  protected async connectF(
    model: mongoose.Model<any>,
    refOrData: any,
    expected?: string,
  ): Promise<mongoose.Schema.Types.ObjectId> {
    let id: mongoose.Schema.Types.ObjectId;
    const ref = typeof refOrData === 'string' && refOrData;
    const data = expected || refOrData;
    const relation = await model.findById(data);
    if (!relation) throw new RpcException('No item found');
    // eslint-disable-next-line prefer-const
    id = relation.id;
    if (!id) throw new RpcException('Only for create and connect');
    if (ref && Object.keys(ActionMapper).includes(ref.split(':')[1])) {
      const [refName, action] = ref.split(':');
      this.references.push({
        model,
        ref: refName,
        id,
        action: ActionMapper[action],
      });
    }
    return id;
  }
  protected async connect(
    model: mongoose.Model<any>,
    refOrData: any,
    expected?: any,
  ): Promise<mongoose.Schema.Types.ObjectId> {
    let id: mongoose.Schema.Types.ObjectId;
    const ref = typeof refOrData === 'string' && refOrData;
    const data = expected || refOrData;
    if (data['create']) {
      const result = await model.create(data['create']);
      id = result.id;
    }
    if (data['connect']) {
      const relation = await model.findOne(data['connect']);
      if (!relation) throw new Error('No item found');
      id = relation.id;
    }
    if (!id) throw new Error('Only for create and connect');
    if (ref && Object.keys(ActionMapper).includes(ref.split(':')[1])) {
      const [refName, action] = ref.split(':');
      this.references.push({
        model,
        ref: refName,
        id,
        action: ActionMapper[action],
      });
    }
    return id;
  }
  protected async sync({ _id: resultId }: { _id: mongoose.Types.ObjectId }) {
    await Promise.all(
      this.references.map(({ model, id, ref, action }) =>
        model.findByIdAndUpdate(id, { [action]: { [ref]: resultId } }),
      ),
    );
    this.references = [];
  }
  protected serelize(data) {
    this.references = [];
    try {
      return JSON.parse(JSON.stringify(data));
    } catch (e) {
      return {};
    }
  }
  protected formatTranslation(data) {
    try {
      return structProtoToJson(data);
      // return Object.keys(data).reduce(
      //   (a, b) => ({
      //     uz: {
      //       ...a['uz'],
      //       [b]: data[b]['uz'],
      //     },
      //     ru: {
      //       ...a['ru'],
      //       [b]: data[b]['ru'],
      //     },
      //     en: {
      //       ...a['en'],
      //       [b]: data[b]['en'],
      //     },
      //   }),
      //   {},
      // );
    } catch (e) {
      return {};
    }
  }
  protected translationMapper(data) {
    return Array.isArray(data)
      ? data?.map((item) => ({
        create: item.create
          ? {
            ...item.create,
            translation: this.formatTranslation(item.create?.translation),
          }
          : undefined,
        connect: item.connect,
      }))
      : data;
  }
  protected cleanProductOne(data: any) {
    return {
      ...data?._doc,
      brand: this.cleanBrand(data?.brand),
      characteristics: data?.characteristics?.map((e) => {
        return this.cleanCharacteristics(e);
      }),
      categories: data?.categories?.map((e) => {
        return this.cleanCategory(e);
      }),
      variants: data?.variants?.map((e) => {
        return this.cleanVariant(e);
      }),
    };
  }
  protected cleanProductAll(data: any) {
    return {
      ...data,
      brand: this.cleanBrand(data.brand),
      characteristics: data?.characteristics?.map((e) => {
        return this.cleanCharacteristics(e);
      }),
      categories: data?.categories?.map((e) => {
        return this.cleanCategory(e);
      }),
      variants: data?.variants?.map((e) => {
        return this.cleanVariant(e);
      }),
    };
  }
}
