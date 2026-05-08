/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Checkout from './pages/Checkout';
import Home from './pages/Home';
import Kitchen from './pages/Kitchen';
import Menu from './pages/Menu';
import MyOrders from './pages/MyOrders';
import NewOrder from './pages/NewOrder';
import OrderDetail from './pages/OrderDetail';
import Orders from './pages/Orders';
import Reports from './pages/Reports';
import Stock from './pages/Stock';
import TrackOrder from './pages/TrackOrder';
import Customers from './pages/Customers';
import MenuManagement from './pages/MenuManagement';
import Settings from './pages/Settings';
import AdminHome from './pages/AdminHome';
import UserManagement from './pages/UserManagement';
import DeleteAccount from './pages/DeleteAccount';


export const PAGES = {
    "Checkout": Checkout,
    "Home": Home,
    "Kitchen": Kitchen,
    "Menu": Menu,
    "MyOrders": MyOrders,
    "NewOrder": NewOrder,
    "OrderDetail": OrderDetail,
    "Orders": Orders,
    "Reports": Reports,
    "Stock": Stock,
    "TrackOrder": TrackOrder,
    "Customers": Customers,
    "MenuManagement": MenuManagement,
    "Settings": Settings,
    "AdminHome": AdminHome,
    "UserManagement": UserManagement,
    "DeleteAccount": DeleteAccount,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};