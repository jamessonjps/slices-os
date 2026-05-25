import { lazy } from 'react';

// Área Pública
const Checkout = lazy(() => import('./pages/Checkout'));
const Home = lazy(() => import('./pages/Home'));

const MyOrders = lazy(() => import('./pages/MyOrders'));
const NewOrder = lazy(() => import('./pages/NewOrder'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
const Wizard = lazy(() => import('./components/wizard/PizzaWizard'));
const TermsOfUse = lazy(() => import('./pages/TermsOfUse'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));

// Área Admin (Lazy Loaded para não pesar o bundle público)
const Kitchen = lazy(() => import('./pages/Kitchen'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const Orders = lazy(() => import('./pages/Orders'));
const Reports = lazy(() => import('./pages/Reports'));
const Stock = lazy(() => import('./pages/Stock'));
const Customers = lazy(() => import('./pages/Customers'));
const MenuManagement = lazy(() => import('./pages/MenuManagement'));
const Settings = lazy(() => import('./pages/Settings'));
const AdminHome = lazy(() => import('./pages/AdminHome'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const DeleteAccount = lazy(() => import('./pages/DeleteAccount'));
const DeliveryDashboard = lazy(() => import('./pages/DeliveryDashboard'));

// Arquivo que criamos manualmente para o login
const Login = lazy(() => import('./pages/Login'));
const SignUp = lazy(() => import('./pages/SignUp'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

export const PAGES = {
    "Checkout": Checkout,
    "Home": Home,
    "Kitchen": Kitchen,

    "MyOrders": MyOrders,
    "NewOrder": NewOrder,
    "Wizard": Wizard,
    "OrderDetail": OrderDetail,
    "Orders": Orders,
    "Reports": Reports,
    "Stock": Stock,
    "TrackOrder": TrackOrder,
    "TermsOfUse": TermsOfUse,
    "PrivacyPolicy": PrivacyPolicy,
    "Customers": Customers,
    "MenuManagement": MenuManagement,
    "Settings": Settings,
    "AdminHome": AdminHome,
    "UserManagement": UserManagement,
    "DeleteAccount": DeleteAccount,
    "DeliveryDashboard": DeliveryDashboard,
    "Login": Login,
    "SignUp": SignUp,
    "ResetPassword": ResetPassword,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};