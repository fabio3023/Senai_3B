const sequelize = require('../infrastructure/database/sequelize');
const LeituraModel = require('../infrastructure/database/models/LeituraModel');
const SequelizeLeituraRepository = require('../infrastructure/repositories/SequelizeLeituraRepository');
const LeituraService = require('../application/services/LeituraService');
const HealthService = require('../application/services/HealthService');
const LeituraController = require('../presentation/http/controllers/LeituraController');
const HealthController = require('../presentation/http/controllers/HealthController');

function createContainer() {
  const leituraRepository = new SequelizeLeituraRepository({
    model: LeituraModel,
    sequelize
  });

  const leituraService = new LeituraService({ leituraRepository });
  const healthService = new HealthService({ sequelize });

  const leituraController = new LeituraController({ leituraService });
  const healthController = new HealthController({ healthService });

  return Object.freeze({
    sequelize,
    leituraRepository,
    leituraService,
    healthService,
    leituraController,
    healthController
  });
}

module.exports = createContainer;
