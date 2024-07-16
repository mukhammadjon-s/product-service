// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mongoose = require('mongoose');

const defineModels = () => {
  mongoose.model('variants', new mongoose.Schema({}), 'variants');
  const CategoryModel = mongoose.model(
    'categories',
    new mongoose.Schema({
      parentId: String,
      id: String,
    }),
    'categories',
  );
  mongoose.model('brands', new mongoose.Schema({}), 'brands');

  const ProductModel = mongoose.model(
    'products',
    new mongoose.Schema({
      variants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'variants' }],
      brand: { type: mongoose.Schema.Types.ObjectId, ref: 'brands' },
      categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'categories' }],
    }),
    'products',
  );

  return {
    ProductModel,
    CategoryModel,
  };
};

module.exports = (async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI);
    const { CategoryModel } = defineModels();
    const categories = await CategoryModel.find();
    const orphans = [];
    for (let i = 0; i < categories.length; i++) {
      const c = categories[i];
      const cat = await categories.find(
        (cc) => cc._id.toString() === c.parentId,
      );
      if (c.parentId && !cat) {
        orphans.push(cat);
        console.log('Orphan', c);
        // await CategoryModel.deleteOne({ _id: c._id });
      }
    }
    console.log(
      'Please cross check the categoreis with below ids before deletion.',
    );
    console.log(orphans.length, ' ophan categories');
    console.log(orphans.map((c) => c.id));
    console.log(
      'Once you are sure, uncomment the line 48 and re-run the script it will delete all those orphan categories',
    );
  } catch (e) {
    console.log(e);
  }
  process.exit(0);
})();
