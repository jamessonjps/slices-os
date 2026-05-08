{
  "name": "Product",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Nome do produto"
    },
    "category": {
      "type": "string",
      "enum": [
        "ingrediente",
        "bebida",
        "embalagem"
      ],
      "description": "Categoria do produto"
    },
    "quantity": {
      "type": "number",
      "description": "Quantidade em estoque"
    },
    "unit": {
      "type": "string",
      "enum": [
        "kg",
        "g",
        "l",
        "ml",
        "unidade"
      ],
      "description": "Unidade de medida"
    },
    "min_quantity": {
      "type": "number",
      "description": "Quantidade m\u00ednima em estoque"
    },
    "price": {
      "type": "number",
      "description": "Pre\u00e7o por unidade"
    }
  },
  "required": [
    "name",
    "category",
    "quantity",
    "unit"
  ]
}