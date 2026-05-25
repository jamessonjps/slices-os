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
      const flavors = activeItems.filter(i => i.category === 'flavor').map(i => ({
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
      const sizes = activeItems.filter(i => i.category === 'size').map(i => {
        const nameLower = i.name.toLowerCase();
        let idStr = 'large';
        if (nameLower.includes('pequen') || nameLower.includes('broto')) idStr = 'small';
        else if (nameLower.includes('méd') || nameLower.includes('med')) idStr = 'medium';

        return {
          id: idStr,
          name: i.name,
          basePrice: i.price || 0,
          description: i.description,
          maxFlavors: i.max_flavors || 1,
          slices: idStr === 'small' ? 4 : (idStr === 'medium' ? 6 : 8),
          diameter: idStr === 'small' ? '25cm' : (idStr === 'medium' ? '30cm' : '35cm'),
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
      const extras = activeItems.filter(i => i.category === 'extra').map(i => ({
        id: i.id,
        name: i.name,
        price: i.price || 0,
        description: i.description,
        image: i.image_url
      }));

      // Beverages
      const beverages = activeItems.filter(i => i.category === 'beverage').map(i => ({
        id: i.id,
        name: i.name,
        price: i.price || 0,
        description: i.description,
        image: i.image_url,
        category: i.type || 'refrigerante'
      }));

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
