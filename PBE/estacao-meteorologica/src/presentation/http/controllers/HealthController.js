class HealthController {
  constructor({ healthService }) {
    this.healthService = healthService;
  }

  liveness = (req, res) => {
    res.status(200).json({ data: this.healthService.liveness() });
  };

  readiness = async (req, res) => {
    const data = await this.healthService.readiness();
    res.status(200).json({ data });
  };
}

module.exports = HealthController;
