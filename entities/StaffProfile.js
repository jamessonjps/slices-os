{
  "name": "StaffProfile",
  "type": "object",
  "properties": {
    "user_email": {
      "type": "string",
      "description": "Email do usu\u00e1rio vinculado"
    },
    "name": {
      "type": "string",
      "description": "Nome completo"
    },
    "phone": {
      "type": "string",
      "description": "Telefone"
    },
    "role_title": {
      "type": "string",
      "description": "Fun\u00e7\u00e3o (ex: Gar\u00e7om, Cozinheiro, Entregador)"
    },
    "address": {
      "type": "string",
      "description": "Endere\u00e7o completo"
    },
    "notes": {
      "type": "string",
      "description": "Observa\u00e7\u00f5es"
    },
    "default_password": {
      "type": "string",
      "description": "Senha padr\u00e3o definida pelo admin (para refer\u00eancia)"
    },
    "system_role": {
      "type": "string",
      "enum": [
        "admin",
        "user"
      ],
      "default": "user",
      "description": "Papel no sistema"
    }
  },
  "required": [
    "name",
    "user_email"
  ]
}