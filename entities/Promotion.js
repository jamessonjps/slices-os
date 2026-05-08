{
  "name": "Promotion",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Nome da promo\u00e7\u00e3o"
    },
    "description": {
      "type": "string",
      "description": "Descri\u00e7\u00e3o da promo\u00e7\u00e3o"
    },
    "type": {
      "type": "string",
      "enum": [
        "combo",
        "discount",
        "buy_x_get_y"
      ],
      "description": "Tipo de promo\u00e7\u00e3o"
    },
    "items": {
      "type": "array",
      "description": "IDs dos itens inclu\u00eddos",
      "items": {
        "type": "string"
      }
    },
    "combo_price": {
      "type": "number",
      "description": "Pre\u00e7o do combo"
    },
    "discount_percentage": {
      "type": "number",
      "description": "Porcentagem de desconto"
    },
    "active": {
      "type": "boolean",
      "default": true,
      "description": "Promo\u00e7\u00e3o ativa"
    },
    "start_date": {
      "type": "string",
      "format": "date",
      "description": "Data de in\u00edcio"
    },
    "end_date": {
      "type": "string",
      "format": "date",
      "description": "Data de t\u00e9rmino"
    }
  },
  "required": [
    "name",
    "type",
    "active"
  ]
}