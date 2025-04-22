import { lazy } from 'react';
// project imports
import MainLayout from '../layouts/MainLayout';
import Loadable from '../components/Loadable';
import RequireAuth from './Protected';

// sample page routing
const Home = Loadable(lazy(() => import('../Website/pages/Home')));
const MainPage = Loadable(lazy(() => import('../pages/MainPage')));
const Career = Loadable(lazy(() => import('../Website/pages/Career')));
const Contact = Loadable(lazy(() => import('../Website/pages/Contact')));
const Work = Loadable(lazy(() => import('../Website/pages/Landing')));
const About = Loadable(lazy(() => import('../Website/pages/About')));

const ErrorPage = Loadable(lazy(() => import('../Website/pages/Error')));
// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: (
    <RequireAuth>
      <MainLayout />
    </RequireAuth>
  ),
  children: [
    {
      path: '/home',
      element: <Home />
    },
    {
      path: 'Models',
      element: <MainPage />
    },
    {
      path: 'Models/:id',
      element: <MainPage />
    },
    {
      path: 'career',
      element: <Career />
    },
    {
      path: 'contact',
      element: <Contact />
    },
    {
      path: 'about',
      element: <About />
    },
    {
      path: 'work',
      element: <Work />
    },
    {
      path: '*',
      element: <ErrorPage />
    }
  ]
};

export default MainRoutes;
