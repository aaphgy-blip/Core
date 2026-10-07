import React from 'react';
import { AppContextProvider, useApp } from './direct/context/AppContext.tsx';
import { Header } from './direct/components/Header.tsx';
import { ExploreView } from './direct/components/ExploreView.tsx';
import { RestaurantDetail } from './direct/components/RestaurantDetail.tsx';
import { ProductCustomizeModal } from './direct/components/ProductCustomizeModal.tsx';
import { CartDrawer } from './direct/components/CartDrawer.tsx';
import { CheckoutModal } from './direct/components/CheckoutModal.tsx';
import { MyOrders } from './direct/components/MyOrders.tsx';
import { UserProfile } from './direct/components/UserProfile.tsx';
import { RestaurantPortalView } from './direct/components/RestaurantPortalView.tsx';
import { AuthScreen } from './direct/components/AuthScreen.tsx';
import { ToastContainer } from './direct/components/ToastContainer.tsx';

const AppContent: React.FC = () => {
  const {
    activeView,
    selectedProduct,
    setSelectedProduct,
  } = useApp();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Sticky Header */}
      <Header />

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {activeView === 'explore' && <ExploreView />}
        {activeView === 'restaurant' && <RestaurantDetail />}
        {activeView === 'orders' && <MyOrders />}
        {activeView === 'profile' && <UserProfile />}
        {activeView === 'restaurant_portal' && <RestaurantPortalView />}
      </main>

      {/* Modals & Overlays */}
      {selectedProduct && (
        <ProductCustomizeModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
      <CartDrawer />
      <CheckoutModal />
      <AuthScreen />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppContextProvider>
      <AppContent />
    </AppContextProvider>
  );
}
