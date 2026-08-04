const { z } = require('zod');

const uuidSchema = z.string().uuid('O ID deve ser um UUID válido.');
const skuSchema = z.string().trim().min(2).max(50);
const nameSchema = z.string().trim().min(2).max(150);
const descriptionSchema = z.string().trim().max(2000).nullable().optional();
const categorySchema = z.string().trim().min(2).max(100);
const priceSchema = z.coerce.number().min(0).max(9999999999.99);
const stockSchema = z.coerce.number().int().min(0).max(2147483647);
const booleanQuerySchema = z.preprocess((value) => {
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return value;
}, z.boolean());

const createProductSchema = z.object({
  sku: skuSchema,
  name: nameSchema,
  description: descriptionSchema,
  category: categorySchema,
  price: priceSchema,
  stock: stockSchema.default(0),
  active: z.boolean().default(true),
});

const replaceProductSchema = z.object({
  sku: skuSchema,
  name: nameSchema,
  description: descriptionSchema,
  category: categorySchema,
  price: priceSchema,
  stock: stockSchema,
  active: z.boolean().default(true),
});

const updateProductSchema = z.object({
  sku: skuSchema.optional(),
  name: nameSchema.optional(),
  description: descriptionSchema,
  category: categorySchema.optional(),
  price: priceSchema.optional(),
  stock: stockSchema.optional(),
  active: z.boolean().optional(),
}).refine((payload) => Object.keys(payload).length > 0, {
  message: 'Informe ao menos um campo para atualização.',
});

const productIdSchema = z.object({ id: uuidSchema });

const listProductsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  name: z.string().trim().min(1).optional(),
  sku: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  active: booleanQuerySchema.optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sortBy: z.enum([
    'name',
    'sku',
    'category',
    'price',
    'stock',
    'active',
    'createdAt',
    'updatedAt',
  ])
    .default('createdAt'),
  order: z.enum(['ASC', 'DESC', 'asc', 'desc'])
    .transform((value) => value.toUpperCase())
    .default('DESC'),
}).refine(
  (query) => query.minPrice === undefined
    || query.maxPrice === undefined
    || query.minPrice <= query.maxPrice,
  {
    message: 'minPrice não pode ser maior que maxPrice.',
    path: ['minPrice'],
  },
);

module.exports = {
  createProductSchema,
  replaceProductSchema,
  updateProductSchema,
  productIdSchema,
  listProductsSchema,
};
