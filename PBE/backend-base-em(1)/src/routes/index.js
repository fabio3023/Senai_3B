const express = require('express');
const router = express.Router();
const leituraRoutes = require('./leituraRoutes');

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    rotas: {
      health: '/api/health',
      leituras: '/api/leituras'
    }
  });
});

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

router.use('/leituras', leituraRoutes);

module.exports = router;
