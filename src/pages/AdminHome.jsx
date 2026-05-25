import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChefHat, ShoppingCart, BarChart3, Package, User, UtensilsCrossed, Settings, ArrowLeft, Users, Bike, LogOut } from 'lucide-react';
import SliceOSFooter from '@/components/SliceOSFooter';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/authService';
import { useAuth } from '@/lib/AuthContext';
import logoUrl from '@/assets/logo.jpeg';

export default function AdminHome() {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = ['admin', 'master'].includes(user?.role);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="text-center max-w-sm w-full">
        <div className="mb-12">
          <div className="bg-black rounded-3xl shadow-2xl flex items-center justify-center mx-auto mb-6 border border-slate-800 overflow-hidden w-64 h-32 sm:w-72 sm:h-36 relative">
             <img 
               src={logoUrl} 
               alt="Painel" 
               className="absolute inset-0 w-full h-full object-cover object-center"
               onError={(e) => {
                 e.target.style.display = 'none';
                 e.target.nextSibling.style.display = 'flex';
               }}
             />
             <div className="hidden w-full h-full items-center justify-center bg-white dark:bg-slate-900">
               <ChefHat className="w-12 h-12 text-slate-900 dark:text-white" />
             </div>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Painel de Controle</h1>
          {user && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
              <div className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-purple-500' : 'bg-blue-500'}`} />
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                {user.full_name || user.email} • {user?.role === 'master' ? 'Master' : (isAdmin ? 'Admin' : 'Equipe')}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Link to={createPageUrl('Orders')} className="block">
            <Button className="w-full h-14 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 text-white text-lg font-semibold">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Pedidos
            </Button>
          </Link>

          <Link to={createPageUrl('Kitchen')} className="block">
            <Button variant="outline" className="w-full h-14 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-lg font-semibold hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-800">
              <ChefHat className="w-5 h-5 mr-2" />
              Cozinha
            </Button>
          </Link>

          <Link to={createPageUrl('DeliveryDashboard')} className="block">
            <Button variant="outline" className="w-full h-14 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-lg font-semibold hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-800">
              <Bike className="w-5 h-5 mr-2" />
              Painel de Entregas
            </Button>
          </Link>
          {/* Seções Administrativas - Visíveis apenas para Admin */}
          {isAdmin && (
            <div className="grid grid-cols-2 gap-3 mt-4 border-t border-slate-100 dark:border-slate-800 pt-6">
              <Link to={createPageUrl('Reports')} className="block">
                <Button variant="outline" className="w-full h-12 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-800">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Relatórios
                </Button>
              </Link>

              <Link to={createPageUrl('Stock')} className="block">
                <Button variant="outline" className="w-full h-12 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-800">
                  <Package className="w-4 h-4 mr-2" />
                  Estoque
                </Button>
              </Link>

              <Link to={createPageUrl('MenuManagement')} className="block">
                <Button variant="outline" className="w-full h-12 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-800">
                  <UtensilsCrossed className="w-4 h-4 mr-2" />
                  Cardápio
                </Button>
              </Link>

              <Link to={createPageUrl('Customers')} className="block">
                <Button variant="outline" className="w-full h-12 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-800">
                  <Users className="w-4 h-4 mr-2" />
                  Clientes
                </Button>
              </Link>

              <Link to={createPageUrl('UserManagement')} className="block col-span-2">
                <Button variant="outline" className="w-full h-12 border-2 border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-semibold hover:bg-purple-50 dark:hover:bg-purple-900">
                  <User className="w-4 h-4 mr-2" />
                  Gestão de Usuários
                </Button>
              </Link>

              <Link to={createPageUrl('Settings')} className="block col-span-2">
                <Button variant="outline" className="w-full h-12 border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-800">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </Button>
              </Link>
            </div>
          )}

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2 items-center">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="sm" className="text-slate-500 dark:text-slate-400 hover:text-slate-700">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Voltar ao site
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-red-500 hover:text-red-700 font-bold uppercase tracking-widest text-[10px]"
              onClick={async () => {
                await authService.logout();
                window.location.href = createPageUrl('Login');
              }}
            >
              <LogOut className="w-3 h-3 mr-1" />
              Sair do Sistema
            </Button>
            <Link to={createPageUrl('Menu')} className="text-sm text-slate-400 hover:text-slate-600 dark:text-slate-300 underline">
              Ir para o cardápio online (área do cliente)
            </Link>
          </div>
        </div>

        <SliceOSFooter />
      </div>
    </div>
  );
}
