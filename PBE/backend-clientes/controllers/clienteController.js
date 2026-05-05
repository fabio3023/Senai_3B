import { createClienteDTO } from "../dtos/createClienteDTO.js"

export class ClienteController {
    constructor(clienteService){
        this.clienteService = clienteService
    }
    listar = (req,res) =>{
        //corpo do método
        try {
            // pede para a camada aplicação/service listar os clientes
            const clientes = this.clienteService.listarCliente();

            // retorna os clientes para o front-end
            return res.status(200).json(clientes);
        } catch(err){
            return res.status(500).json({ erro : err.message });
            
        }
    }
    
    criar = (req, res) => {
        //corpo do método
        try {
            const dto = createClienteDTO(req.body)
            const clienteCriado= this.clienteService.cadastrarCliente(dto);

            return res.status(201).json(clienteCriado);
        } catch(err) {
            return res.status(500).json({ erro : err.message });
        }
    }
}