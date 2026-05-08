{
  "name": "Order",
  "type": "object",
  "properties": {
    "customer_id": {
      "type": "string",
      "description": "ID do cliente"
    },
    "customer_name": {
      "type": "string",
      "description": "Nome do cliente"
    },
    "customer_phone": {
      "type": "string",
      "description": "Telefone do cliente"
    },
    "delivery_type": {
      "type": "string",
      "enum": [
        "delivery",
        "pickup"
      ],
      "default": "delivery",
      "description": "Tipo de entrega"
    },
    "address_id": {
      "type": "string",
      "description": "ID do endere\u00e7o de entrega"
    },
    "address_text": {
      "type": "string",
      "description": "Endere\u00e7o completo em texto"
    },
    "pizzas": {
      "type": "array",
      "description": "Pizzas do pedido",
      "items": {
        "type": "object",
        "properties": {
          "size": {
            "type": "string",
            "enum": [
              "6",
              "8",
              "12"
            ]
          },
          "is_half": {
            "type": "boolean"
          },
          "flavor1": {
            "type": "string"
          },
          "flavor2": {
            "type": "string"
          },
          "price": {
            "type": "number"
          },
          "ready": {
            "type": "boolean",
            "default": false
          }
        }
      }
    },
    "drinks": {
      "type": "array",
      "description": "Bebidas do pedido",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "quantity": {
            "type": "number"
          },
          "price": {
            "type": "number"
          },
          "ready": {
            "type": "boolean",
            "default": false
          }
        }
      }
    },
    "total_amount": {
      "type": "number",
      "description": "Valor total do pedido"
    },
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "preparing",
        "ready",
        "delivering",
        "completed",
        "cancelled"
      ],
      "default": "pending",
      "description": "Status do pedido"
    },
    "payment_status": {
      "type": "string",
      "enum": [
        "pending",
        "paid"
      ],
      "default": "pending",
      "description": "Status do pagamento"
    },
    "payment_method": {
      "type": "string",
      "enum": [
        "cash",
        "card",
        "pix"
      ],
      "description": "M\u00e9todo de pagamento"
    },
    "notes": {
      "type": "string",
      "description": "Observa\u00e7\u00f5es do pedido"
    }
  },
  "required": [
    "customer_name",
    "customer_phone",
    "delivery_type",
    "total_amount"
  ]
}