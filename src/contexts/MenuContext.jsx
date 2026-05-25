import React, { createContext, useContext, useState, useEffect } from 'react';
import { menuService } from '@/services/menuService';

const MenuContext = createContext();

export function MenuProvider({ children }) {
  const [menuData, setMenuData] = useState({
    flavors: [],
    extras: [],
    beverages: [],
    sizes: [],
    crusts: [],
    borders: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchMenu = async () => {
    try {
      setIsLoading(true);
      const items = await menuService.listMenuItems();
      const activeItems = items.filter(i => i.available);

      // Flavors
      let flavors = activeItems.filter(i => i.category === 'flavor').map(i => ({
        id: i.id,
        name: i.name,
        description: i.description,
        price_small: i.price_small || 0,
        price_medium: i.price_medium || 0,
        price_large: i.price_large || 0,
        image: i.image_url || 'https://via.placeholder.com/150',
        category: i.type || 'tradicional',
        allowHalfAndHalf: i.allow_half_half
      }));

      // Sizes
      let sizes = activeItems.filter(i => i.category === 'size').map(i => {
        const nameLower = i.name.toLowerCase();
        let idStr = 'grande';
        if (nameLower.includes('pequen') || nameLower.includes('broto')) idStr = 'pequena';
        else if (nameLower.includes('méd') || nameLower.includes('med')) idStr = 'media';

        return {
          id: idStr,
          name: i.name,
          basePrice: i.price || 0,
          description: i.description,
          maxFlavors: i.max_flavors || 1,
          slices: idStr === 'pequena' ? 4 : (idStr === 'media' ? 6 : 8),
          diameter: idStr === 'pequena' ? '25cm' : (idStr === 'media' ? '30cm' : '35cm'),
          image: i.image_url
        };
      });

      // Crusts
      const crusts = activeItems.filter(i => i.category === 'crust').map(i => ({
        id: i.id,
        name: i.name,
        price: i.price || 0,
        description: i.description,
        image: i.image_url
      }));

      // Borders
      const borders = activeItems.filter(i => i.category === 'border').map(i => ({
        id: i.id,
        name: i.name,
        price: i.price || 0,
        description: i.description,
        image: i.image_url
      }));

      // Extras
      let extras = activeItems.filter(i => i.category === 'extra').map(i => ({
        id: i.id,
        name: i.name,
        price: i.price || 0,
        description: i.description,
        image: i.image_url
      }));

      // Beverages
      let beverages = activeItems.filter(i => i.category === 'beverage').map(i => ({
        id: i.id,
        name: i.name,
        price: i.price || 0,
        description: i.description,
        image: i.image_url,
        category: i.type || 'refrigerante'
      }));

      // --- FALLBACKS (Para quando o banco estiver vazio em lojas novas) ---
      if (sizes.length === 0) {
        sizes = [
          { id: 'pequena', name: 'Pequena', basePrice: 35.90, slices: 4, maxFlavors: 1, diameter: '25cm' },
          { id: 'media', name: 'Média', basePrice: 45.90, slices: 6, maxFlavors: 2, diameter: '30cm' },
          { id: 'grande', name: 'Grande', basePrice: 55.90, slices: 8, maxFlavors: 3, diameter: '35cm' }
        ];
      }
      if (crusts.length === 0) {
        crusts = [
          { id: 'tradicional', name: 'Tradicional', price: 0, description: 'Massa fininha e crocante' },
          { id: 'pan', name: 'Massa Pan', price: 4.90, description: 'Mais alta e macia' }
        ];
      }
      if (borders.length === 0) {
        borders = [
          { id: 'sem_borda', name: 'Sem Borda', price: 0 },
          { id: 'catupiry', name: 'Catupiry Original', price: 8.90 },
          { id: 'cheddar', name: 'Cheddar', price: 8.90 }
        ];
      }
      if (flavors.length === 0) {
        flavors = [
          { id: 'mussarela', name: 'Mussarela', description: 'Queijo mussarela derretido, molho de tomate e orégano.', price_small: 0, price_medium: 0, price_large: 0, category: 'tradicional', allowHalfAndHalf: true, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=300' },
          { id: 'calabresa', name: 'Calabresa', description: 'Calabresa fatiada, cebola e azeitonas.', price_small: 0, price_medium: 0, price_large: 0, category: 'tradicional', allowHalfAndHalf: true, image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&q=80&w=300' },
          { id: 'frango_catupiry', name: 'Frango c/ Catupiry', description: 'Frango desfiado temperado coberto com Catupiry original.', price_small: 2, price_medium: 3, price_large: 5, category: 'especial', allowHalfAndHalf: true, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=300' }
        ];
      }

      setMenuData({
        flavors,
        sizes,
        crusts,
        borders,
        extras,
        beverages
      });
    } catch (error) {
      console.error("Erro ao buscar cardápio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // --- Funções Auxiliares (Para quando o usuário editar via Admin) ---
  const reloadMenu = () => fetchMenu();

  return (
    <MenuContext.Provider
      value={{
        ...menuData,
        isLoading,
        reloadMenu
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu deve ser usado dentro de um MenuProvider');
  }
  return context;
}
