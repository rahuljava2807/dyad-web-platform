import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';
import FeedbackPage from '../pages/FeedbackPage';

export const feedbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/feedback',
  component: FeedbackPage,
});