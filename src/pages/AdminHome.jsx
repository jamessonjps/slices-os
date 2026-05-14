import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChefHat, ShoppingCart, BarChart3, Package, User, UtensilsCrossed, Settings, ArrowLeft, Users } from 'lucide-react';
import SliceOSFooter from '@/components/SliceOSFooter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';

export default function AdminHome() {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="text-center max-w-sm w-full">
        <div className="mb-12">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl mb-6 inline-block">
            <ChefHat className="w-12 h-12 text-slate-900 dark:text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Painel de Controle</h1>
          {user && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
              <div className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-purple-500' : 'bg-blue-500'}`} />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {user.full_name || user.email} • {isAdmin ? 'Admin' : 'Equipe'}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Link to={createPageUrl('Orders')} className="block">
            <Button className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white text-lg font-semibold">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Pedidos
            </Button>
          </Link>

          <Link to={createPageUrl('Kitchen')} className="block">
            <Button variant="outline" className="w-full h-14 border-2 border-slate-300 text-slate-900 text-lg font-semibold hover:bg-slate-50">
              <ChefHat className="w-5 h-5 mr-2" />
              Cozinha
            </Button>
          </Link>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <Link to={createPageUrl('Customers')} className="block col-span-2">
              <Button variant="outline" className="w-full h-12 border-2 border-slate-300 text-slate-900 font-semibold hover:bg-slate-50">
                <User className="w-4 h-4 mr-2" />
                Clientes
              </Button>
            </Link>

            {isAdmin && (
              <>
                <Link to={createPageUrl('Reports')} className="block">
                  <Button variant="outline" className="w-full h-12 border-2 border-slate-300 text-slate-900 font-semibold hover:bg-slate-50">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Relatórios
                  </Button>
                </Link>

                <Link to={createPageUrl('Stock')} className="block">
                  <Button variant="outline" className="w-full h-12 border-2 border-slate-300 text-slate-900 font-semibold hover:bg-slate-50">
                    <Package className="w-4 h-4 mr-2" />
                    Estoque
                  </Button>
                </Link>

                <Link to={createPageUrl('MenuManagement')} className="block">
                  <Button variant="outline" className="w-full h-12 border-2 border-slate-300 text-slate-900 font-semibold hover:bg-slate-50">
                    <UtensilsCrossed className="w-4 h-4 mr-2" />
                    Cardápio
                  </Button>
                </Link>

                <Link to={createPageUrl('Settings')} className="block">
                  <Button variant="outline" className="w-full h-12 border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50">
                    <Settings className="w-4 h-4 mr-2" />
                    Configurações
                  </Button>
                </Link>

                <Link to={createPageUrl('UserManagement')} className="block col-span-2">
                  <Button variant="outline" className="w-full h-12 border-2 border-purple-300 text-purple-700 font-semibold hover:bg-purple-50">
                    <Users className="w-4 h-4 mr-2" />
                    Gestão de Usuários
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 flex flex-col gap-2 items-center">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Voltar ao site
              </Button>
            </Link>
            <Link to={createPageUrl('Menu')} className="text-sm text-slate-400 hover:text-slate-600 underline">
              Ir para o cardápio online (área do cliente)
            </Link>
          </div>
        </div>

        <SliceOSFooter />
      </div>
    </div>
  );
}