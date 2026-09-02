import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import { AppProvider } from "./modules/SharedStateAndPersistence";
import { HomePage } from "./pages/HomePage";
import { BrowsePage } from "./pages/BrowsePage";
import { ListingsSlugPage } from "./pages/ListingsSlugPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ComparePage } from "./pages/ComparePage";
import { NotFoundPage } from "./modules/NotFoundPage";

/**
 * Routed app shell: ONE page component per route, each page its route's
 * single product surface. Implement a capability in its module under
 * src/modules; the module renders inside its route's page. Never render
 * another route's content, never add a second surface to a page.
 */
export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="app">
          <header className="topbar">
            <div className="topbar__inner">
              <span className="brand app__title">Silicon Exchange</span>
              <nav className="nav app__nav">
                <NavLink to="/" end className={({ isActive }) => isActive ? "nav__item nav__item--active" : "nav__item"}>Home</NavLink>
                <NavLink to="/browse" className={({ isActive }) => isActive ? "nav__item nav__item--active" : "nav__item"}>Browse</NavLink>
                <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav__item nav__item--active" : "nav__item"}>Dashboard</NavLink>
                <NavLink to="/compare" className={({ isActive }) => isActive ? "nav__item nav__item--active" : "nav__item"}>Compare</NavLink>
              </nav>
            </div>
          </header>
          <main className="app__main main--page">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/browse" element={<BrowsePage />} />
              <Route path="/listings/:slug" element={<ListingsSlugPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
