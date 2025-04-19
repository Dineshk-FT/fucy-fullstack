import { lazy } from 'react';
import Loadable from '../ui-component/Loadable';
import MainLayout from '../layout/MainLayout';
import RequireAuth from './Protected';

const Home = Loadable(lazy(() => import('../Website/HomePage')));
const MainPage = Loadable(lazy(() => import('../Website/MainPage')));
const Career = Loadable(lazy(() => import('../Website/CareerPage')));
const Contact = Loadable(lazy(() => import('../Website/ContactPage')));
const Work = Loadable(lazy(() => import('../Website/YourWorkSection')));
const About = Loadable(lazy(() => import('../Website/AboutPage')));
const Dashboard = Loadable(lazy(() => import('../Website/Dashboard')));

// const ErrorPage = Loadable(lazy(()=>import('../views/ErrorPage')));

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
