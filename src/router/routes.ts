import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

// Each page is its own chunk, fetched the first time its route is visited.
const HomePage = lazy(() => import("../pages/HomePage"));
const AboutPage = lazy(() => import("../pages/AboutPage"));
const MerchandisingPage = lazy(() => import("../pages/MerchandisingPage"));
const CustomersPage = lazy(() => import("../pages/CustomersPage"));
const ContactPage = lazy(() => import("../pages/ContactPage"));
const WovenPage = lazy(() => import("../pages/WovenPage"));
const DenimMillPage = lazy(() => import("../pages/DenimMillPage"));
const LaundryPage = lazy(() => import("../pages/LaundryPage"));
const SweaterPage = lazy(() => import("../pages/SweaterPage"));
const DesignStudioPage = lazy(() => import("../pages/DesignStudioPage"));
const EmbroideryPage = lazy(() => import("../pages/EmbroideryPage"));
const AncillaryPage = lazy(() => import("../pages/AncillaryPage"));
const GalleryPage = lazy(() => import("../pages/GalleryPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));

/** The pages rendered inside the Shell layout, served by a hash router: the
    path lives after the "#" (/#/about, /#/about#leadership), so any static host
    can serve the site without a rewrite to index.html. The catch-all stays last. */
const routes: RouteObject[] = [
  { index: true, Component: HomePage },
  { path: "about", Component: AboutPage },
  { path: "merchandising", Component: MerchandisingPage },
  { path: "customers", Component: CustomersPage },
  { path: "contact", Component: ContactPage },
  { path: "businesses/woven", Component: WovenPage },
  { path: "businesses/denim-mill", Component: DenimMillPage },
  { path: "businesses/laundry", Component: LaundryPage },
  { path: "businesses/sweater", Component: SweaterPage },
  { path: "businesses/design-studio", Component: DesignStudioPage },
  { path: "businesses/embroidery-printing-accessories", Component: EmbroideryPage },
  { path: "businesses/ancillary", Component: AncillaryPage },
  { path: "gallery", Component: GalleryPage },
  { path: "*", Component: NotFoundPage },
];

export default routes;
