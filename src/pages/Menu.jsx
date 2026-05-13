import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
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

export default function Menu() {
  const [cart, setCart] = useState([]);
  const [suggestions, setSuggestions] = useState(null);
  const [pizzaDialog, setPizzaDialog] = useState(null); // { pizza } being configured
  const [pizzaConfig, setPizzaConfig] = useState({ size: 8, isHalf: false, flavor2: '' });

  const { data: menuItems = [] } = useQuery({
    queryKey: ['menu-items-public'],
    queryFn: async () => {
      const items = await base44.entities.MenuItem.list();
      return items.filter(item => item.available);
    }
  });

  const pizzas = menuItems.filter(item => item.type === 'pizza');
  const drinks = menuItems.filter(item => item.type === 'drink');
  const desserts = menuItems.filter(item => item.type === 'dessert');

  const pizzasTradicionais = pizzas.filter(p => p.category === 'pizza_tradicional');
  const pizzasEspeciais = pizzas.filter(p => p.category === 'pizza_especial');
  const pizzasDoces = pizzas.filter(p => p.category === 'pizza_doce');

  // Pizzas que têm opção de 6 fatias
  const pizzas6Fatias = pizzas.filter(p => p.price_small);

  // Metade padronizada: tradicional = R$18, especial = R$25
  const getHalfValue = (pizza) => {
    if (!pizza) return 18;
    if (pizza.category === 'pizza_especial') return 25;
    return 18; // tradicional
  };

  const openPizzaDialog = (pizza) => {
    setPizzaDialog(pizza);
    // Se não tem 6 fatias, começa com 8
    const defaultSize = pizza.price_small ? 6 : 8;
    setPizzaConfig({ size: defaultSize, isHalf: false, flavor2: '' });
  };

  const getHalfPrice = (pizza1, flavor2Name) => {
    if (!pizza1) return 0;
    const pizza2 = pizzas.find(p => p.name === flavor2Name);
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
    toast.success('Pizza adicionada ao carrinho! 🍕');
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
    <div className="min-h-screen bg-background">
      {/* Header Premium */}
      <div className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-full mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              <Link to={createPageUrl('Home')}>
                <Button variant="ghost" size="icon" className="h-9 w-9 md:h-10 md:w-10">
                  <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
              </Link>
              <img
                src="https://media.base44.com/images/public/698b33880f8f26bcac1c2f36/acd017143_Semttulo.jpg"
                alt="Pizza Millano Pizzaria"
                className="h-8 md:h-10 w-auto rounded-lg flex-shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-base md:text-lg font-bold text-foreground truncate">Millano Pizzaria</h1>
                <p className="text-xs text-muted-foreground">Faça seu pedido online</p>
              </div>
            </div>
            
            {cart.length > 0 && (
              <Button 
                onClick={handleCheckout}
                className="flex items-center gap-2 ml-auto flex-shrink-0"
                size="sm"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline text-xs md:text-sm">
                  {cart.reduce((sum, i) => sum + i.quantity, 0)} itens
                </span>
                <span className="sm:hidden">{cart.reduce((sum, i) => sum + i.quantity, 0)}</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-4 py-6 md:py-8 pb-24">
        {menuItems.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Pizza className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg md:text-xl font-semibold text-foreground">Cardápio em atualização</p>
            <p className="text-sm mt-2">Em breve nossos sabores estarão disponíveis!</p>
          </div>
        )}

        {/* Pizzas Especiais */}
        {pizzasEspeciais.length > 0 && (
          <div className="mb-8">
            <div className="mb-4">
              <h2 className="text-lg md:text-2xl font-bold text-foreground mb-1">Pizzas Especiais</h2>
              <p className="text-xs md:text-sm text-muted-foreground">8 fatias • R$ 50,00</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {pizzasEspeciais.map((pizza) => (
                <Card key={pizza.id} className="flex flex-col p-3 md:p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm md:text-base text-foreground truncate">{pizza.name}</h3>
                      {pizza.description && (
                        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mt-1">{pizza.description}</p>
                      )}
                    </div>
                    {pizza.is_promotion && (
                      <Badge variant="warning" size="sm" className="flex-shrink-0">
                        <Sparkles className="w-3 h-3 mr-0.5" />
                        Promo
                      </Badge>
                    )}
                  </div>
                  <Button
                    className="w-full mt-auto"
                    variant="default"
                    size="sm"
                    onClick={() => openPizzaDialog(pizza)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    <span className="hidden xs:inline">Adicionar</span>
                    <span className="xs:hidden">+</span>
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Pizzas Tradicionais */}
        {pizzasTradicionais.length > 0 && (
          <div className="mb-8">
            <div className="mb-4">
              <h2 className="text-lg md:text-2xl font-bold text-foreground mb-1">Pizzas Tradicionais</h2>
              <p className="text-xs md:text-sm text-muted-foreground">8 fatias a partir de R$ 35,00</p>
              <div className="mt-2 inline-block text-xs md:text-sm px-3 py-1.5 rounded-lg bg-warning/10 text-warning border border-warning/20">
                ⭐ 6 fatias a partir de R$ 28,00
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {pizzasTradicionais.map((pizza) => (
                <Card key={pizza.id} className="flex flex-col p-3 md:p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm md:text-base text-foreground truncate">{pizza.name}</h3>
                      {pizza.description && (
                        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mt-1">{pizza.description}</p>
                      )}
                    </div>
                    {pizza.is_promotion && (
                      <Badge variant="warning" size="sm" className="flex-shrink-0">
                        <Sparkles className="w-3 h-3 mr-0.5" />
                      </Badge>
                    )}
                  </div>
                  <Button
                    className="w-full mt-auto"
                    variant="default"
                    size="sm"
                    onClick={() => openPizzaDialog(pizza)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    <span className="hidden xs:inline">Adicionar</span>
                    <span className="xs:hidden">+</span>
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Pizzas 6 Fatias */}
        {pizzas6Fatias.length > 0 && (
          <div className="mb-8">
            <div className="mb-4">
              <h2 className="text-lg md:text-2xl font-bold text-foreground mb-1">Pizzas 6 Fatias</h2>
              <p className="text-xs md:text-sm text-muted-foreground">1 sabor • R$ 28,00</p>
              <div className="mt-2 inline-block text-xs md:text-sm px-3 py-1.5 rounded-lg bg-warning/10 text-warning border border-warning/20">
                ⭐ Promoção especial
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {pizzas6Fatias.map((pizza) => (
                <Card key={pizza.id} className="flex flex-col p-3 md:p-4 border-warning/20 bg-warning/5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm md:text-base text-foreground truncate">{pizza.name}</h3>
                      {pizza.description && (
                        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mt-1">{pizza.description}</p>
                      )}
                    </div>
                    <Badge variant="warning" size="sm" className="flex-shrink-0">
                      6 fatias
                    </Badge>
                  </div>
                  <div className="text-sm font-semibold text-foreground mb-2">
                    R$ {pizza.price_small?.toFixed(2)}
                  </div>
                  <Button
                    className="w-full mt-auto"
                    variant="default"
                    size="sm"
                    onClick={() => openPizzaDialog(pizza)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    <span className="hidden xs:inline">Adicionar</span>
                    <span className="xs:hidden">+</span>
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Pizzas Doces */}
        {pizzasDoces.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg md:text-2xl font-bold text-foreground mb-4">Pizzas Doces</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {pizzasDoces.map((pizza) => (
                <Card key={pizza.id} className="flex flex-col p-3 md:p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-sm md:text-base text-foreground mb-2">{pizza.name}</h3>
                  {pizza.description && (
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-3">{pizza.description}</p>
                  )}
                  <Button
                    className="w-full mt-auto"
                    variant="default"
                    size="sm"
                    onClick={() => openPizzaDialog(pizza)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    <span className="hidden xs:inline">Adicionar</span>
                    <span className="xs:hidden">+</span>
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Drinks */}
        {drinks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg md:text-2xl font-bold text-foreground mb-4">Bebidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {drinks.map((drink) => (
                <Card key={drink.id} className="flex flex-col p-3 md:p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-sm md:text-base text-foreground mb-2">{drink.name}</h3>
                  {drink.description && (
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-3">{drink.description}</p>
                  )}
                  <div className="text-sm font-semibold text-foreground mb-2">
                    R$ {drink.price?.toFixed(2)}
                  </div>
                  <Button
                    className="w-full mt-auto"
                    variant="default"
                    size="sm"
                    onClick={() => addDrink(drink)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    <span className="hidden xs:inline">Adicionar</span>
                    <span className="xs:hidden">+</span>
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Desserts */}
        {desserts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg md:text-2xl font-bold text-foreground mb-4">Sobremesas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {desserts.map((dessert) => (
                <Card key={dessert.id} className="flex flex-col p-3 md:p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-sm md:text-base text-foreground mb-2">{dessert.name}</h3>
                  {dessert.description && (
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-3">{dessert.description}</p>
                  )}
                  <div className="text-sm font-semibold text-foreground mb-2">
                    R$ {dessert.price?.toFixed(2)}
                  </div>
                  <Button
                    className="w-full mt-auto"
                    variant="default"
                    size="sm"
                    onClick={() => addDessert(dessert)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    <span className="hidden xs:inline">Adicionar</span>
                    <span className="xs:hidden">+</span>
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cart Floating Button (Mobile) */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-4 right-4 md:hidden">
          <Button 
            onClick={handleCheckout}
            className="w-full h-12"
            size="lg"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Carrinho • R$ {total.toFixed(2)}
          </Button>
        </div>
      )}

      {/* Pizza Dialog */}
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
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Bebidas</h2>
            <div className="grid grid-cols-2 gap-3">
              {drinks.map((drink) => (
                <Card key={drink.id} className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-2">{drink.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-900">R$ {drink.price?.toFixed(2)}</span>
                    <Button size="sm" onClick={() => addDrink(drink)}>
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
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Sobremesas</h2>
            <div className="grid grid-cols-2 gap-3">
              {desserts.map((dessert) => (
                <Card key={dessert.id} className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-2">{dessert.name}</h3>
                  {dessert.description && (
                    <p className="text-xs text-slate-600 mb-2">{dessert.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-900">R$ {dessert.price?.toFixed(2)}</span>
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
            <DialogTitle>🍕 {pizzaDialog?.name}</DialogTitle>
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
                    <div className="font-bold text-base">R$ {pizzaDialog.price_small.toFixed(2)}</div>
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
                  <div className="font-bold text-base">R$ {pizzaDialog?.price_medium?.toFixed(2)}</div>
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
                  {pizzas.filter(p => p.id !== pizzaDialog?.id).map(p => (
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
                      <span className="text-xs text-slate-400">R$ {getHalfValue(p).toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {pizzaConfig.size === 6 && (
              <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                ⭐ Promoção! Pizza de 6 fatias aceita apenas 1 sabor
              </p>
            )}

            <Button
              className="w-full bg-red-600 hover:bg-red-700 text-white h-12"
              disabled={pizzaConfig.size === 8 && pizzaConfig.isHalf && !pizzaConfig.flavor2}
              onClick={confirmPizza}
            >
              Adicionar — R$ {
                pizzaConfig.size === 6
                  ? pizzaDialog?.price_small?.toFixed(2)
                  : (pizzaConfig.isHalf && pizzaConfig.flavor2)
                    ? getHalfPrice(pizzaDialog, pizzaConfig.flavor2).toFixed(2)
                    : pizzaDialog?.price_medium?.toFixed(2)
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
                  <p className="text-slate-900 font-bold">R$ {drink.price?.toFixed(2)}</p>
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
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="mb-3 max-h-40 overflow-y-auto space-y-2">
              {cart.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <span className="text-slate-900 text-xs truncate">
                      {item.type === 'pizza' ? `${item.name} (${item.size}f)` : item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(i, -1)}>
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-5 text-center text-sm">{item.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(i, 1)}>
                      <Plus className="w-3 h-3" />
                    </Button>
                    <span className="text-slate-600 ml-1 text-sm w-16 text-right">R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Total</p>
                <p className="text-2xl font-bold text-slate-900">R$ {total.toFixed(2)}</p>
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