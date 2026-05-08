{
  "name": "Customer",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Nome do cliente"
    },
    "phone": {
      "type": "string",
      "description": "Telefone do cliente"
    },
    "email": {
      "type": "string",
      "description": "Email do cliente"
    },
    "notes": {
      "type": "string",
      "description": "Observa\u00e7\u00f5es sobre o cliente"
    }
  },
  "required": [
    "name",
    "phone"
  ]
}