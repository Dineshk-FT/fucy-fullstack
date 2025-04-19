import { lazy } from 'react';
import Loadable from '../components/Loadable';
import MainLayout from '../layouts/MainLayout';
import RequireAuth from './Protected';

const Home = Loadable(lazy(() => import('../Website/pages/Home')));
const MainPage = Loadable(lazy(() => import('../pages/MainPage')));
const Career = Loadable(lazy(() => import('../Website/pages/Career')));
const Contact = Loadable(lazy(() => import('../Website/pages/Contact')));
const Work = Loadable(lazy(() => import('../Website/pages/Landing/YourWorkSection')));
const About = Loadable(lazy(() => import('../Website/pages/About')));
const Dashboard = Loadable(lazy(() => import('../Website/components/Dashboard')));
const ErrorPage = Loadable(lazy(() => import('../Website/pages/Error')));

const commonRoutes = [
  {
    path: '/home',
    element: <Home />
  },
  {
    path: '/career',
    element: <Career />
  },
  {
    path: '/contact',
    element: <Contact />
  },
  {
    path: '/about',
    element: <About />
  },
  {
    path: '/Models',
    element: <MainPage />
  },
  {
    path: '/dashboard',
    element: <Dashboard />
  },
  {
    path: '/Models/:id',
    element: <MainPage />
  },
  {
    path: '/work',
    element: <Work />
  },
  {
    path: '*',
    element: <ErrorPage />
  }
];

// const finialisedRoute = (routes = commonRoutes) => {

//   let finalRoute = [];
//   routes &&
//     routes?.forEach((route) => {
//       if (route.path === '*') {
//         finalRoute.push({
//           path: '*',
//           element: route.element
//         });
//       }
//     });

//   return finalRoute;
// };

const MainRoutes = {
  path: '/',
  element: (
    <RequireAuth>
      <MainLayout />
    </RequireAuth>
  ),
  children: commonRoutes
};

export default MainRoutes;
