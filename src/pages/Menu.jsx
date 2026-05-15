import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { safeLocalStorage } from '@/utils/storage';
import { Pizza, ShoppingCart, Plus, Minus, Sparkles, Trash2, ArrowLeft } from 'lucide-react';
import SliceOSFooter from '@/components/SliceOSFooter';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { menuService } from '@/services/menuService';
import { settingsService } from '@/services/settingsService';
import { isOpen } from '@/utils/businessHours';

export default function Menu() {
  const [cart, setCart] = useState([]);
  const [suggestions, setSuggestions] = useState(null);
  const [pizzaDialog, setPizzaDialog] = useState(null); 
  const [pizzaConfig, setPizzaConfig] = useState({ size: 8, isHalf: false, flavor2: '' });

  const formatPrice = (val) => {
    if (val == null || isNaN(val)) return '0.00';
    return Number(val).toFixed(2);
  };

  const { data: menuItems = [] } = useQuery({
    queryKey: ['menu-items-public'],
    queryFn: async () => {
      const items = await menuService.listMenuItems();
      return items.filter(item => item.available);
    }
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getStoreSettings()
  });

  const open = isOpen(settings?.business_hours);

  const pizzas = menuItems.filter(item => item.type === 'pizza');
  const drinks = menuItems.filter(item => item.type === 'drink');
  const desserts = menuItems.filter(item => item.type === 'dessert');

  const pizzasTradicionais = pizzas.filter(p => p.category === 'pizza_tradicional');
  const pizzasEspeciais = pizzas.filter(p => p.category === 'pizza_especial');
  const pizzasDoces = pizzas.filter(p => p.category === 'pizza_doce');

  // Pizzas que têm opção de 6 fatias
  const pizzas6Fatias = pizzas.filter(p => p.price_small);

  // Metade dinâmica com arredondamento rigoroso: Math.ceil(preco / 2)
  const getHalfValue = (pizza) => {
    if (!pizza || !pizza.price_medium) return 0;
    return Math.ceil(pizza.price_medium / 2);
  };

  const openPizzaDialog = (pizza) => {
    setPizzaDialog(pizza);
    // Se não tem 6 fatias, começa com 8
    const defaultSize = pizza.price_small ? 6 : 8;
    setPizzaConfig({ size: defaultSize, isHalf: false, flavor2: '' });
  };

  const getHalfPrice = (pizza1, flavor2Name) => {
    if (!pizza1) return 0;
    // Busca apenas pizzas que permitem meio a meio
    const pizza2 = pizzas.find(p => p.name === flavor2Name && p.allow_half_half);
    if (!pizza2) return pizza1.price_medium || 0;
    return getHalfValue(pizza1) + getHalfValue(pizza2);
  };

  const confirmPizza = () => {
    const { size, isHalf, flavor2 } = pizzaConfig;
    const canHalf = size === 8;
    let price;
    if (canHalf && isHalf && flavor2) {
      price = getHalfPrice(pizzaDialog, flavor2);
    } else {
      const priceKey = size === 6 ? 'price_small' : 'price_medium';
      price = pizzaDialog[priceKey];
    }
    const label = canHalf && isHalf && flavor2
      ? `½ ${pizzaDialog.name} / ½ ${flavor2}`
      : pizzaDialog.name;
    const newItem = {
      type: 'pizza',
      name: label,
      flavor1: pizzaDialog.name,
      flavor2: canHalf && isHalf ? flavor2 : '',
      is_half: canHalf && isHalf && !!flavor2,
      size,
      price,
      quantity: 1,
      itemId: pizzaDialog.id
    };
    setCart([...cart, newItem]);
    setPizzaDialog(null);
    toast.success('Pizza adicionada ao carrinho!');
    if (!cart.some(i => i.type === 'drink')) {
      setSuggestions({ type: 'drink', message: 'Que tal uma bebida gelada?' });
    }
  };

  const addDrink = (drink) => {
    const existing = cart.find(i => i.type === 'drink' && i.name === drink.name);
    if (existing) {
      setCart(cart.map(i => 
        i.type === 'drink' && i.name === drink.name 
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      setCart([...cart, { type: 'drink', name: drink.name, price: drink.price, quantity: 1, itemId: drink.id }]);
    }
    setSuggestions(null);
  };

  const addDessert = (dessert) => {
    const existing = cart.find(i => i.type === 'dessert' && i.name === dessert.name);
    if (existing) {
      setCart(cart.map(i => 
        i.type === 'dessert' && i.name === dessert.name 
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      setCart([...cart, { type: 'dessert', name: dessert.name, price: dessert.price, quantity: 1, itemId: dessert.id }]);
    }
  };

  const removeItem = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const updateQuantity = (index, delta) => {
    const newCart = [...cart];
    newCart[index].quantity = Math.max(1, newCart[index].quantity + delta);
    setCart(newCart);
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const navigate = useNavigate();

  const handleCheckout = () => {
    safeLocalStorage.set('cart', JSON.stringify(cart));
    navigate(createPageUrl('Checkout'));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Home')}>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                  <ArrowLeft className="w-5 h-5 text-slate-900 dark:text-white" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Millano Pizzaria</h1>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${open ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {open ? 'Aberto agora • Peça Online' : 'Fechado no momento'}
                  </p>
                </div>
              </div>
            </div>
            {cart.length > 0 && (
              <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-black">
                {cart.reduce((sum, i) => sum + i.quantity, 0)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 pb-32">
        {menuItems.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <Pizza className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl font-semibold">Cardápio em atualização</p>
            <p className="text-sm mt-2">Em breve nossos sabores estarão disponíveis!</p>
          </div>
        )}

        {/* Pizzas Especiais */}
        {pizzasEspeciais.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Pizzas Especiais</h2>
            <p className="text-sm text-slate-500 mb-4">8 fatias R$ 50,00</p>
            <div className="space-y-4">
              {pizzasEspeciais.map((pizza) => (
                <Card key={pizza.id} className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">{pizza.name}</h3>
                      {pizza.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">{pizza.description}</p>
                      )}
                    </div>

                  </div>
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => openPizzaDialog(pizza)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar ao Carrinho
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Pizzas Tradicionais */}
        {pizzasTradicionais.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Pizzas Tradicionais</h2>
            <p className="text-sm text-slate-500 mb-1">8 fatias a partir de R$ 35,00</p>

            <div className="space-y-4">
              {pizzasTradicionais.map((pizza) => (
                <Card key={pizza.id} className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">{pizza.name}</h3>
                      {pizza.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">{pizza.description}</p>
                      )}
                    </div>

                  </div>
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => openPizzaDialog(pizza)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar ao Carrinho
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Pizzas 6 Fatias */}
        {pizzas6Fatias.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Pizzas 6 Fatias</h2>
            <p className="text-sm text-slate-500 mb-1">Apenas 1 sabor • R$ 28,00</p>

            <div className="space-y-4">
              {pizzas6Fatias.map((pizza) => (
                <Card key={pizza.id} className="p-4 border-amber-200 bg-amber-50/30">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{pizza.name}</h3>
                      {pizza.description && (
                        <p className="text-sm text-slate-600">{pizza.description}</p>
                      )}
                    </div>
                    <Badge className="bg-amber-500 text-white">
                      <Sparkles className="w-3 h-3 mr-1" />
                      6 fatias
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-slate-900">R$ {formatPrice(pizza.price_small)}</span>
                    <span className="text-xs text-slate-500">8 fatias: R$ {formatPrice(pizza.price_medium)}</span>
                  </div>
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => openPizzaDialog(pizza)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar ao Carrinho
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Pizzas Doces */}
        {pizzasDoces.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Pizzas Doces</h2>
            <div className="space-y-4">
              {pizzasDoces.map((pizza) => (
                <Card key={pizza.id} className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">{pizza.name}</h3>
                  {pizza.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{pizza.description}</p>
                  )}
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => openPizzaDialog(pizza)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar ao Carrinho
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Drinks */}
        {drinks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Bebidas</h2>
            <div className="grid grid-cols-2 gap-3">
              {drinks.map((drink) => (
                <Card key={drink.id} className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{drink.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">R$ {formatPrice(drink.price)}</span>
                    <Button size="sm" onClick={() => addDrink(drink)} className="bg-red-600 hover:bg-red-700 text-white">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Desserts */}
        {desserts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Sobremesas</h2>
            <div className="grid grid-cols-2 gap-3">
              {desserts.map((dessert) => (
                <Card key={dessert.id} className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-2">{dessert.name}</h3>
                  {dessert.description && (
                    <p className="text-xs text-slate-600 mb-2">{dessert.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-900">R$ {formatPrice(dessert.price)}</span>
                    <Button size="sm" onClick={() => addDessert(dessert)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
        <SliceOSFooter />
      </div>

      {/* Pizza Config Dialog */}
      <Dialog open={!!pizzaDialog} onOpenChange={(open) => { if (!open) setPizzaDialog(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{'🍕'} {pizzaDialog?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
          {pizzaDialog && (<>
            {/* Size */}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Tamanho</p>
              <div className={`grid gap-2 ${pizzaDialog?.price_small ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {pizzaDialog?.price_small && (
                  <button
                    onClick={() => setPizzaConfig(c => ({ ...c, size: 6, isHalf: false, flavor2: '' }))}
                    className={`border rounded-lg p-3 text-center text-sm transition-all ${
                      pizzaConfig.size === 6
                        ? 'border-red-600 bg-red-50 text-red-700 font-semibold'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="font-bold">6 fatias</div>
                    <div className="text-xs text-slate-500 mb-1">apenas 1 sabor</div>
                    <div className="font-bold text-base">R$ {formatPrice(pizzaDialog.price_small)}</div>
                  </button>
                )}
                <button
                  onClick={() => setPizzaConfig(c => ({ ...c, size: 8, isHalf: false, flavor2: '' }))}
                  className={`border rounded-lg p-3 text-center text-sm transition-all ${
                    pizzaConfig.size === 8
                      ? 'border-red-600 bg-red-50 text-red-700 font-semibold'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="font-bold">8 fatias</div>
                  <div className="text-xs text-slate-500 mb-1">pode meio a meio</div>
                  <div className="font-bold text-base">R$ {formatPrice(pizzaDialog?.price_medium)}</div>
                </button>
              </div>
            </div>

            {/* Half/Half toggle — só para 8 fatias */}
            {pizzaConfig.size === 8 && (
              <div className="flex items-center justify-between border rounded-lg p-3">
                <div>
                  <p className="font-medium text-slate-900 text-sm">Meio a meio</p>
                  <p className="text-xs text-slate-500">Escolha um segundo sabor</p>
                </div>
                <button
                  onClick={() => setPizzaConfig(c => ({ ...c, isHalf: !c.isHalf, flavor2: '' }))}
                  className={`w-12 h-6 rounded-full transition-colors relative ${pizzaConfig.isHalf ? 'bg-red-600' : 'bg-slate-300'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${pizzaConfig.isHalf ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            )}

            {/* Second flavor */}
            {pizzaConfig.size === 8 && pizzaConfig.isHalf && (
              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Segundo sabor</p>
                <p className="text-xs text-slate-500 mb-2">Preço = metade de cada sabor somados</p>
                <div className="max-h-40 overflow-y-auto space-y-1 border rounded-lg p-2">
                  {pizzas.filter(p => p.id !== pizzaDialog?.id && p.allow_half_half).map(p => (
                    <button
                      key={p.id}
                      onClick={() => setPizzaConfig(c => ({ ...c, flavor2: p.name }))}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-all flex justify-between items-center ${
                        pizzaConfig.flavor2 === p.name
                          ? 'bg-red-50 text-red-700 font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{p.name}</span>
                      <span className="text-xs text-slate-400">R$ {formatPrice(getHalfValue(p))}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {pizzaConfig.size === 6 && (
              <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                {'⭐'} Promoção! Pizza de 6 fatias aceita apenas 1 sabor
              </p>
            )}

            <Button
              className="w-full bg-red-600 hover:bg-red-700 text-white h-12"
              disabled={pizzaConfig.size === 8 && pizzaConfig.isHalf && !pizzaConfig.flavor2}
              onClick={confirmPizza}
            >
              Adicionar {'—'} R$ {
                pizzaConfig.size === 6
                  ? formatPrice(pizzaDialog?.price_small)
                  : (pizzaConfig.isHalf && pizzaConfig.flavor2)
                    ? formatPrice(getHalfPrice(pizzaDialog, pizzaConfig.flavor2))
                    : formatPrice(pizzaDialog?.price_medium)
              }
            </Button>
          </>)}
          </div>
        </DialogContent>
      </Dialog>

      {/* Suggestions Dialog */}
      <Dialog open={!!suggestions} onOpenChange={() => setSuggestions(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Sugestão para você!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-slate-600">{suggestions?.message}</p>
            <div className="grid grid-cols-2 gap-3">
              {suggestions?.type === 'drink' && drinks.slice(0, 4).map((drink) => (
                <Card key={drink.id} className="p-3 cursor-pointer hover:border-slate-400" onClick={() => {
                  addDrink(drink);
                  setSuggestions(null);
                }}>
                  <p className="font-semibold text-sm">{drink.name}</p>
                  <p className="text-slate-900 font-bold">R$ {formatPrice(drink.price)}</p>
                </Card>
              ))}
            </div>
            <Button variant="outline" className="w-full" onClick={() => setSuggestions(null)}>
              Não, obrigado
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cart Fixed Bottom */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="mb-3 max-h-40 overflow-y-auto space-y-2">
              {cart.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <span className="text-slate-900 dark:text-slate-100 text-xs truncate">
                      {item.type === 'pizza' ? `${item.name} (${item.size}f)` : item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-6 w-6 dark:text-slate-100" onClick={() => updateQuantity(i, -1)}>
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-5 text-center text-sm dark:text-slate-100">{item.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 dark:text-slate-100" onClick={() => updateQuantity(i, 1)}>
                      <Plus className="w-3 h-3" />
                    </Button>
                    <span className="text-slate-600 dark:text-slate-400 ml-1 text-sm w-16 text-right">R$ {formatPrice(item.price * item.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Total</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">R$ {formatPrice(total)}</p>
              </div>
              <Button
                onClick={handleCheckout}
                className="bg-red-600 hover:bg-red-700 h-12 px-8"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Finalizar Pedido
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
