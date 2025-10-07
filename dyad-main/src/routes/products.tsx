import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';
import ProductsPage from '../pages/ProductsPage';

export const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products',
  component: ProductsPage,
});