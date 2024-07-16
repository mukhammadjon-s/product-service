const mongoose = require('mongoose');
const categories = require('./categories');
require('dotenv').config();

const seeders = [
  { model: 'categories', schema: categories.schema, data: categories.data },
];

async function* seed(model, data) {
  for (let i = 0; i < data.length; i++) {
    const result = await model.create(data[i]);
    yield result;
  }
}

async function main() {
  await mongoose.connect(process.env.MONGO_DB_URI);
  for (let i = 0; i < seeders.length; i++) {
    const model = mongoose.model(seeders[i].model, seeders[i].schema);
    for await (let result of seed(model, seeders[i].data)) {
      console.log('Created: ', result.id);
      console.log(result);
    }
  }
  await mongoose.disconnect();
}

main();
