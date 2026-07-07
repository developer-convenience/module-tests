import { useCallback, useEffect, useState } from "react";



import {

  addCustomToCart,

  addStandardToCart,

  type CartLine,

  getCartCount,

  loadCartFromStorage,

  removeLine,

  saveCartToStorage,

  updateLineQuantity,

} from "./cart";

import "./tokens.css";

import "./animations.css";

import Header from "./components/Header";

import HomePage from "./pages/HomePage";

import ShopPage from "./pages/ShopPage";

import ProductDetailPage from "./pages/ProductDetailPage";

import CustomPage from "./pages/CustomPage";

import AtelierPage from "./pages/AtelierPage";

import CartPage from "./pages/CartPage";

import CheckoutPage from "./pages/CheckoutPage";

import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";

import CheckoutFailPage from "./pages/CheckoutFailPage";

import LoginPage from "./pages/LoginPage";

import MyPage from "./pages/MyPage";

import OrderDetailPage from "./pages/OrderDetailPage";

import AdminPage from "./pages/AdminPage";

import { NavProvider } from "./context/NavContext";

import type { AppRoute, Page } from "./routes";



const HOME_ROUTE: AppRoute = { page: "home" };



function parsePaymentFromUrl(): AppRoute | null {

  const params = new URLSearchParams(window.location.search);

  const page = params.get("page");



  if (page === "checkout-success") {

    const paymentKey = params.get("paymentKey");

    const orderId = params.get("orderId");

    const amount = params.get("amount");

    if (paymentKey && orderId && amount) {

      return {

        page: "checkout-success",

        payment: { paymentKey, orderId, amount },

      };

    }

  }



  if (page === "checkout-fail") {

    return {

      page: "checkout-fail",

      payment: {

        code: params.get("code") ?? undefined,

        message: params.get("message") ?? undefined,

        orderId: params.get("orderId") ?? undefined,

      },

    };

  }



  if (page === "admin") {

    return { page: "admin" };

  }



  return null;

}



function getInitialRoute(): AppRoute {

  const paymentRoute = parsePaymentFromUrl();

  if (paymentRoute) {

    window.history.replaceState({}, "", window.location.pathname);

    return paymentRoute;

  }

  return HOME_ROUTE;

}



export default function App() {

  const [route, setRoute] = useState<AppRoute>(getInitialRoute);

  const [cart, setCart] = useState<CartLine[]>(() => loadCartFromStorage());



  useEffect(() => {

    saveCartToStorage(cart);

  }, [cart]);



  const navigate = useCallback((next: AppRoute) => {

    setRoute(next);

    window.scrollTo(0, 0);

  }, []);



  const goHome = useCallback(() => navigate(HOME_ROUTE), [navigate]);



  const goShop = useCallback(() => navigate({ page: "shop" }), [navigate]);



  const goProduct = useCallback(

    (productId: string) => navigate({ page: "product", productId }),

    [navigate],

  );



  const goCustom = useCallback(

    (productId?: string) => navigate({ page: "custom", productId }),

    [navigate],

  );



  const goAtelier = useCallback(() => navigate({ page: "atelier" }), [navigate]);



  const goCart = useCallback(() => navigate({ page: "cart" }), [navigate]);



  const goCheckout = useCallback(() => {

    if (cart.length === 0) {

      navigate({ page: "cart" });

      return;

    }

    navigate({ page: "checkout" });

  }, [cart.length, navigate]);



  const goLogin = useCallback(

    (pendingClaim?: { orderId: string; claimToken: string }) => {

      navigate({ page: "login", pendingClaim });

    },

    [navigate],

  );



  const goMyPage = useCallback(() => navigate({ page: "mypage" }), [navigate]);



  const goOrderDetail = useCallback(

    (orderId: string) => navigate({ page: "order-detail", orderId }),

    [navigate],

  );



  function handleAddToCart(productId: string) {

    setCart((prev) => addStandardToCart(prev, productId));

  }



  function handleAddCustomToCart(item: Omit<CartLine & { kind: "custom" }, "kind" | "lineId" | "quantity">) {

    setCart((prev) =>

      addCustomToCart(prev, {

        productId: item.productId,

        leatherId: item.leatherId,

        stitchId: item.stitchId,

        monogram: item.monogram,

      }),

    );

    navigate({ page: "cart" });

  }



  function handleUpdateQuantity(lineId: string, delta: number) {

    setCart((prev) => updateLineQuantity(prev, lineId, delta));

  }



  function handleRemoveLine(lineId: string) {

    setCart((prev) => removeLine(prev, lineId));

  }



  function scrollToShop() {

    if (route.page !== "home") {

      navigate(HOME_ROUTE);

      requestAnimationFrame(() => {

        document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });

      });

      return;

    }

    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });

  }



  function handleNav(page: Page) {

    switch (page) {

      case "home":

        goHome();

        break;

      case "shop":

        goShop();

        break;

      case "custom":

        goCustom();

        break;

      case "atelier":

        goAtelier();

        break;

      case "cart":

        goCart();

        break;

      case "checkout":

        goCheckout();

        break;

      case "login":

        goLogin();

        break;

      case "mypage":

        goMyPage();

        break;

      case "checkout-success":

      case "checkout-fail":

      case "order-detail":

      case "admin":

        break;

    }

  }



  const handlePaymentComplete = useCallback(() => {

    setCart([]);

  }, []);



  const isHome = route.page === "home";

  const hideHeader =

    route.page === "checkout-success" || route.page === "checkout-fail";



  return (

    <NavProvider onNavigate={handleNav}>

    <div className="leather-shop">

      {!hideHeader ? (

        <Header

          onNavigate={handleNav}

          onLogin={() => goLogin()}

          onMyPage={goMyPage}

          cartCount={getCartCount(cart)}

          overlay={isHome}

        />

      ) : null}

      {route.page === "home" && (

        <HomePage
          onDiscover={scrollToShop}
          onProductSelect={goProduct}
          onShop={goShop}
          onCustom={goCustom}
          onAtelier={goAtelier}
        />

      )}

      {route.page === "shop" && <ShopPage onProductSelect={goProduct} />}

      {route.page === "product" && route.productId && (

        <ProductDetailPage

          productId={route.productId}

          onBack={goShop}

          onCustom={goCustom}

          onAddToCart={() => handleAddToCart(route.productId!)}

        />

      )}

      {route.page === "custom" && (

        <CustomPage

          productId={route.productId}

          onBack={goShop}

          onAddToCart={handleAddCustomToCart}

        />

      )}

      {route.page === "atelier" && <AtelierPage />}

      {route.page === "cart" && (

        <CartPage

          cart={cart}

          onBack={goShop}

          onCheckout={goCheckout}

          onUpdateQuantity={handleUpdateQuantity}

          onRemove={handleRemoveLine}

        />

      )}

      {route.page === "checkout" && (

        <CheckoutPage cart={cart} onBack={goCart} onEmptyCart={goCart} />

      )}

      {route.page === "checkout-success" && route.payment?.paymentKey && route.payment.orderId && route.payment.amount ? (

        <CheckoutSuccessPage

          payment={{

            paymentKey: route.payment.paymentKey,

            orderId: route.payment.orderId,

            amount: route.payment.amount,

          }}

          onComplete={handlePaymentComplete}

          onHome={goHome}

          onLogin={goLogin}

          onMyPage={goMyPage}

        />

      ) : null}

      {route.page === "checkout-fail" ? (

        <CheckoutFailPage

          payment={route.payment}

          onRetry={goCheckout}

          onHome={goHome}

        />

      ) : null}

      {route.page === "login" ? (

        <LoginPage

          onBack={goHome}

          onSuccess={goMyPage}

          pendingClaim={route.pendingClaim}

        />

      ) : null}

      {route.page === "mypage" ? (

        <MyPage onLogin={() => goLogin()} onOrderSelect={goOrderDetail} onBack={goHome} />

      ) : null}

      {route.page === "order-detail" && route.orderId ? (

        <OrderDetailPage

          orderId={route.orderId}

          onBack={goMyPage}

          onLogin={() => goLogin()}

        />

      ) : null}

      {route.page === "admin" ? <AdminPage onBack={goHome} /> : null}

    </div>

    </NavProvider>

  );

}


