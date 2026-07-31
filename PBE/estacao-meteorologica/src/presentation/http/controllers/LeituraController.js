class LeituraController {
  constructor({ leituraService }) {
    this.leituraService = leituraService;
  }

  listar = async (req, res) => {
    const result = await this.leituraService.listar(req.query);
    res.status(200).json(result);
  };

  buscarPorId = async (req, res) => {
    const data = await this.leituraService.buscarPorId(req.params.id);
    res.status(200).json({ data });
  };

  criar = async (req, res) => {
    const data = await this.leituraService.criar(req.body);
    res.status(201).location(`${req.baseUrl}/${data.id}`).json({ data });
  };

  substituir = async (req, res) => {
    const data = await this.leituraService.substituir(req.params.id, req.body);
    res.status(200).json({ data });
  };

  atualizarParcialmente = async (req, res) => {
    const data = await this.leituraService.atualizarParcialmente(req.params.id, req.body);
    res.status(200).json({ data });
  };

  remover = async (req, res) => {
    await this.leituraService.remover(req.params.id);
    res.status(204).send();
  };

  removerTodas = async (req, res) => {
    const data = await this.leituraService.removerTodas();
    res.status(200).json({ data });
  };
}

module.exports = LeituraController;
