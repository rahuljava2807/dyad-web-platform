import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';
import BillingPage from '../pages/BillingPage';

export const billingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/billing',
  component: BillingPage,
});