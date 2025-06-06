import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import { Outlet, Navigate } from 'react-router-dom';
import Navbar from './Global/js/Navbar';
import ScrollToTop from './ScrollToTop';
import U_Home from './User/js/U_Home';
import ProductListingPage from './User/js/ProductListingPage';
import Footer from './Global/js/Footer';
import Support from './Global/js/Support';
import SingleProductDetails from './User/js/SingleProductDetails';
import Cart from './User/js/Cart';
import CheckoutPage from './User/js/CheckoutPage';
import Sidebar from './Global/js/Sidebar';
import SellerHome from './Seller/js/SellerHome';
import SellerSidebar from './Global/js/SellerSidebar';
import ShopPage from './Seller/js/ShopPage';
import OrderDetailsPage from './Seller/js/OrderDetailsPage';
import AddNewShop from './Seller/js/AddNewShop';
import SubmitNewShopConfirmation from './Seller/js/SubmitNewShopConfirmation';
import AddNewProduct from './Seller/js/AddNewProduct';
import AdminHome from './Admin/js/AdminHome';
import AdminSidebar from './Global/js/AdminSidebar';
import SellerData from './Admin/js/SellerData';
import SellerDataSingle from './Admin/js/SellerDataSingle';
import ShopDetails from './Admin/js/ShopDetails';
import ShopList from './Admin/js/ShopList';
import ProductDetails from './Admin/js/ProductDetails';
import InvoicePage from './Admin/js/InvoicePage';
import SignIn from './Global/js/SignIn';
import RequestRecieved from './Seller/js/RequestRecieved';
import SingleProductDetailsSeller from './Seller/js/SingleProductDetailsSeller';
import SellerNavbar from './Seller/js/SellerNavbar';
import AdminNavbar from './Admin/js/AdminNavbar';
import UserNavbar from './User/js/UserNavbar';
import AdminOrders from './Admin/js/AdminOrders';
import OrderDetails from './Admin/js/OrderDetails';
import Comissions from './Admin/js/Comissions';
import InvoicePageDetails from './Admin/js/InvoicePageDetails';
import Advertisements from './Admin/js/Advertisements';
import SignUp from './Global/js/SignUp';
import Categories from './Admin/js/Categories';
import TermsAndConditions from './Global/js/TermsAndConditions';
import PrivacyPolicy from './Global/js/PrivacyPolicy';
import AboutUs from './Global/js/AboutUs';


const ProtectedSellerRoute = () => {
  const sellerToken = localStorage.getItem("sellerToken");
  return sellerToken ? <Outlet /> : <Navigate to="/signin" replace />;
};

const ProtectedAdminRoute = () => {
  const adminToken = localStorage.getItem("adminToken");
  return adminToken ? <Outlet /> : <Navigate to="/signin" replace />;
};

const Layout = () => {
  const location = useLocation();
  const path = location.pathname;

  const renderNavbar = () => {
    if (path.startsWith('/admin')) return <AdminNavbar />;
    if (path.startsWith('/seller')) return <SellerNavbar />;
    return <UserNavbar />;
  };

  const getContainerClass = () => {
    if (path.startsWith('/admin')) return 'content-container';
    if (path.startsWith('/seller')) return 'content-container';
    return 'user-container';
  };

  return (
    <>
      {renderNavbar()}
      <div className={getContainerClass()}>
        <Routes>
            <Route element={<AppLayout />}>
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/" element={<U_Home />} />
              <Route path="/recommended-for-you" element={<ProductListingPage panel={1} />} />
              <Route path="/featured-products" element={<ProductListingPage panel={2} />} />
              <Route path="/categories" element={<ProductListingPage panel={3} />} />
              <Route path="/category/:id" element={<ProductListingPage panel={4} />} />
              <Route path="/search-products/:query" element={<ProductListingPage panel={5} />} />
              <Route path="/product/:id" element={<SingleProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<CheckoutPage />} />

              <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/about-us" element={<AboutUs />} />

            </Route>

          <Route element={<ProtectedSellerRoute />}>
            <Route element={<SellerLayout />}>
              <Route path="/seller" element={<SellerHome />} />
              <Route path="/seller/shop/new" element={<AddNewShop />} />
              <Route path="/seller/shop/confirmed" element={<SubmitNewShopConfirmation />} />
              <Route path="/seller/shop/:id" element={<ShopPage />} />
              <Route path="/seller/order/:id" element={<OrderDetailsPage />} />
              <Route path="/seller/request/complete" element={<RequestRecieved />} />
              <Route path="/seller/product/new/:id" element={<AddNewProduct />} />
              <Route path="/seller/product/details/:id" element={<SingleProductDetailsSeller />} />
            </Route>
          </Route>

          <Route element={<ProtectedAdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminHome />} />
              <Route path="/admin/sellers" element={<SellerData />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/order/:id" element={<OrderDetails />} />
              <Route path="/admin/sellers/info/:id" element={<SellerDataSingle />} />
              <Route path="/admin/comissions" element={<Comissions />} />
              <Route path="/admin/shops" element={<ShopList />} />
              <Route path="/admin/shop/info/:id" element={<ShopDetails />} />
              <Route path="/admin/shop/product/:id" element={<ProductDetails />} />
              <Route path="/admin/invoices" element={<InvoicePage />} />
              <Route path="/admin/invoices/:id" element={<InvoicePageDetails />} />
              <Route path="/admin/ads/" element={<Advertisements />} />
              <Route path="/admin/categories/" element={<Categories />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        <div className="pad-for-side">
          <Support />
          <Footer />
        </div>
      </div>
    </>
  );
};


function App() {
  return (
    <Router>
      <ScrollToTop />
      <Layout />
    </Router>
  );
}


const AppLayout = () => {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 pad-for-side">
        <Outlet />
      </main>
    </div>
  );
};

const SellerLayout = () => {
  return (
    <div className="flex">
      <SellerSidebar />
      <main className="flex-1 pad-for-side">
        <Outlet />
      </main>
    </div>
  );
};

const AdminLayout = () => {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 pad-for-side">
        <Outlet />
      </main>
    </div>
  );
};


export default App;
