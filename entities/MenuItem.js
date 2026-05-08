{
  "name": "MenuItem",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Nome do item"
    },
    "category": {
      "type": "string",
      "enum": [
        "pizza_tradicional",
        "pizza_especial",
        "pizza_doce",
        "bebida",
        "sobremesa"
      ],
      "description": "Categoria do item"
    },
    "type": {
      "type": "string",
      "enum": [
        "pizza",
        "drink",
        "dessert"
      ],
      "description": "Tipo do item"
    },
    "description": {
      "type": "string",
      "description": "Descri\u00e7\u00e3o do item"
    },
    "price_small": {
      "type": "number",
      "description": "Pre\u00e7o tamanho pequeno (6 fatias)"
    },
    "price_medium": {
      "type": "number",
      "description": "Pre\u00e7o tamanho m\u00e9dio (8 fatias)"
    },
    "price": {
      "type": "number",
      "description": "Pre\u00e7o \u00fanico (para bebidas e sobremesas)"
    },
    "available": {
      "type": "boolean",
      "default": true,
      "description": "Dispon\u00edvel no card\u00e1pio"
    },
    "prep_time": {
      "type": "number",
      "default": 30,
      "description": "Tempo de preparo em minutos"
    },
    "is_promotion": {
      "type": "boolean",
      "default": false,
      "description": "Item em promo\u00e7\u00e3o"
    }
  },
  "required": [
    "name",
    "category",
    "type",
    "available"
  ]
}