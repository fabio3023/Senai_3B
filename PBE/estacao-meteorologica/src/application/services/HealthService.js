class HealthService {
  constructor({ sequelize }) {
    this.sequelize = sequelize;
  }

  liveness() {
    return {
      status: 'ok',
      service: 'backend-em',
      timestamp: new Date().toISOString()
    };
  }

  async readiness() {
    await this.sequelize.authenticate();
    return {
      status: 'ready',
      database: 'connected',
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = HealthService;
