require('dotenv').config({ path: '.env' });

export const helperMsUrl = process.env.HELPER_MS_URl;
export const ownerMsUrl = process.env.OWNER_MS_URI;
export const importMsUrl = process.env.IMPORT_MS_URl;
export const shopMsUrl = process.env.SHOP_MS_URl;

export const GRPC_HELPER_PACKAGE = 'helper';
export const GRPC_COMPANY_PACKAGE = 'company';
export const GRPC_WAREHOUSE_PACKAGE = 'warehouse';
export const GRPC_IMPORT_PACKAGE = 'import';
export const GRPC_ORDER_PACKAGE = 'order';

export const sizes = {
  'хс': 'XS',
  'с': 'S',
  'c': 'S',
  'м': 'M',
  'л': 'L',
  'хл': 'XL',
  '2хл': 'XXL',
  '3хл': 'XXXL',
  '4хл': '4XL',
  '5хл': '5XL',
  '6хл': '6XL',
  '7хл': '7XL',
}

export const sizesValues = {
  'XS': 40,
  'S': 42,
  'M': 44,
  'L': 46,
  'XL': 48,
  'XXL': 50,
  'XXXL': 52,
  '4XL': 54,
  '5XL': 56,
  '6XL': 58,
  '7XL': 60,
}
