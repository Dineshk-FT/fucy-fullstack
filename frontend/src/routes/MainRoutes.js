import { lazy } from 'react';
// project imports
import MainLayout from '../layout/MainLayout';
import Loadable from '../ui-component/Loadable';
import RequireAuth from './Protected';

// sample page routing
const Home = Loadable(lazy(() => import('../Website/HomePage')));
const MainPage = Loadable(lazy(() => import('../views/MainPage')));
const Career = Loadable(lazy(() => import('../Website/CareerPage')));
const Contact = Loadable(lazy(() => import('../Website/ContactPage')));
const Work = Loadable(lazy(() => import('../Website/Landing/YourWorkSection')));
const About = Loadable(lazy(() => import('../Website/AboutPage')));

const ErrorPage = Loadable(lazy(() => import('../Website/ErrorPage')));
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
