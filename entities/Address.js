{
  "name": "Address",
  "type": "object",
  "properties": {
    "customer_id": {
      "type": "string",
      "description": "ID do cliente"
    },
    "bairro": {
      "type": "string",
      "description": "Bairro"
    },
    "rua": {
      "type": "string",
      "description": "Rua"
    },
    "numero": {
      "type": "string",
      "description": "N\u00famero"
    },
    "complemento": {
      "type": "string",
      "description": "Complemento"
    },
    "referencia": {
      "type": "string",
      "description": "Ponto de refer\u00eancia"
    }
  },
  "required": [
    "customer_id",
    "bairro",
    "rua",
    "numero"
  ]
}