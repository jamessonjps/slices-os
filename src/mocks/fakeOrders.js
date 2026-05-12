export const fakeOrders = [
  {
    id: 'order-1001',
    customer_name: 'Ana Silva',
    customer_phone: '(11) 91234-5678',
    delivery_type: 'delivery',
    address_text: 'Rua das Flores, 45 - Centro',
    payment_method: 'card',
    payment_status: 'paid',
    status: 'pending',
    total_amount: 82.5,
    created_date: '2026-05-12T14:30:00.000Z',
    notes: 'Sem cebola',
    pizzas: [
      {
        size: '8',
        is_half: false,
        flavor1: 'Margherita',
        flavor2: '',
        price: 40,
        quantity: 1,
        ready: false
      }
    ],
    drinks: [
      { name: 'Refrigerante 600ml', quantity: 1, price: 7.5, ready: false }
    ]
  },
  {
    id: 'order-1002',
    customer_name: 'Bruno Costa',
    customer_phone: '(11) 99876-5432',
    delivery_type: 'pickup',
    address_text: 'Praça Largo do Carmo, 12',
    payment_method: 'cash',
    payment_status: 'pending',
    status: 'preparing',
    total_amount: 63,
    created_date: '2026-05-12T13:45:00.000Z',
    notes: 'Massa fina',
    pizzas: [
      {
        size: '10',
        is_half: false,
        flavor1: 'Calabresa',
        flavor2: '',
        price: 45,
        quantity: 1,
        ready: false
      }
    ],
    drinks: [
      { name: 'Suco de Laranja', quantity: 1, price: 18, ready: false }
    ]
  },
  {
    id: 'order-1003',
    customer_name: 'Carla Pereira',
    customer_phone: '(21) 91234-0000',
    delivery_type: 'delivery',
    address_text: 'Av. Paulista, 1234 - Bela Vista',
    payment_method: 'card',
    payment_status: 'paid',
    status: 'ready',
    total_amount: 98,
    created_date: '2026-05-12T12:10:00.000Z',
    notes: '',
    pizzas: [
      {
        size: '10',
        is_half: true,
        flavor1: 'Quatro Queijos',
        flavor2: 'Frango com Catupiry',
        price: 65,
        quantity: 1,
        ready: true
      }
    ],
    drinks: [
      { name: 'Água Mineral', quantity: 2, price: 3, ready: true }
    ]
  }
];
