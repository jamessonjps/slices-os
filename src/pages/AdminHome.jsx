import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChefHat, ShoppingCart, BarChart3, Package, User, UtensilsCrossed, Settings, ArrowLeft, Users } from 'lucide-react';
import SliceOSFooter from '@/components/SliceOSFooter';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function AdminHome() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {
      setUser(null);
    });
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        <div className="mb-8">
          <img
            src="https://media.base44.com/images/public/698b33880f8f26bcac1c2f36/acd017143_Semttulo.jpg"
            alt="Milano Pizzaria"
            className="w-56 mx-auto rounded-xl mb-3"
          />
          <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Painel Administrativo</p>
          {user && (
            <p className="text-xs text-slate-400 mt-1">
              {user.full_name || user.email} — <span className={`font-semibold ${isAdmin ? 'text-purple-600' : 'text-blue-600'}`}>{isAdmin ? 'Administrador' : 'Funcionário'}</span>
            </p>
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