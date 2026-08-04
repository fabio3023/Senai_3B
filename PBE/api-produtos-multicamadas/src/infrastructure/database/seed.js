const ensureDatabaseExists = require('./ensureDatabaseExists');
const initializeDatabase = require('./initializeDatabase');
const sequelize = require('./sequelize');
const ProductModel = require('./models/ProductModel');

const products = [
  {
    sku: 'NOTE-001',
    name: 'Notebook Educacional',
    description: 'Notebook para atividades de programação e escritório.',
    price: 3499.90,
    stock: 12,
    active: true,
  },
  {
    sku: 'MOUSE-001',
    name: 'Mouse USB',
    description: 'Mouse óptico com conexão USB.',
    price: 59.90,
    stock: 40,
    active: true,
  },
  {
    sku: 'TECL-001',
    name: 'Teclado USB',
    description: 'Teclado padrão ABNT2.',
    price: 119.90,
    stock: 25,
    active: true,
  },
];

async function seed() {
  try {
    await ensureDatabaseExists();
    await initializeDatabase();
    await ProductModel.bulkCreate(products, { ignoreDuplicates: true });
    console.log('Carga inicial concluída.');
  } catch (error) {
    console.error('Falha ao executar a carga inicial:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close().catch(() => undefined);
  }
}

seed();
