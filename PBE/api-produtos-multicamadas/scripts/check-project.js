const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const projectRoot = path.resolve(__dirname, '..');
const requiredFiles = [
  'package.json',
  '.env.example',
  'src/server.js',
  'src/app.js',
  'src/application/services/ProductService.js',
  'src/infrastructure/repositories/SequelizeProductRepository.js',
  'src/presentation/controllers/ProductController.js',
  'src/presentation/routes/productRoutes.js',
  'README.md',
];

function collectJavaScriptFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory() && entry.name !== 'node_modules') {
      return collectJavaScriptFiles(fullPath);
    }

    return entry.isFile() && entry.name.endsWith('.js') ? [fullPath] : [];
  });
}

let hasError = false;

for (const relativePath of requiredFiles) {
  if (!fs.existsSync(path.join(projectRoot, relativePath))) {
    console.error(`Arquivo obrigatório ausente: ${relativePath}`);
    hasError = true;
  }
}

for (const filePath of collectJavaScriptFiles(projectRoot)) {
  const result = spawnSync(process.execPath, ['--check', filePath], { encoding: 'utf8' });

  if (result.status !== 0) {
    console.error(`Erro de sintaxe em ${path.relative(projectRoot, filePath)}:`);
    console.error(result.stderr);
    hasError = true;
  }
}

if (hasError) {
  process.exit(1);
}

console.log('Estrutura obrigatória presente e todos os arquivos JavaScript têm sintaxe válida.');
