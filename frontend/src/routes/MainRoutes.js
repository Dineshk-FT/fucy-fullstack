import { lazy } from 'react';
// project imports
import MainLayout from '../layout/MainLayout';
import Loadable from '../ui-component/Loadable';
import RequireAuth from './Protected';

// sample page routing
const Home = Loadable(lazy(() => import('../views/HomePage')));
const MainCanvas = Loadable(lazy(() => import('../views/MainCanvas')));
const Career = Loadable(lazy(() => import('../views/CareerPage')));
const Contact = Loadable(lazy(() => import('../views/ContactPage')));
const About = Loadable(lazy(() => import('../views/AboutPage')));

const ErrorPage = Loadable(lazy(() => import('../views/ErrorPage')));
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
      element: <MainCanvas />
    },
    {
      path: 'Models/:id',
      element: <MainCanvas />
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
      path: '*',
      element: <ErrorPage />
    }
  ]
};

export default MainRoutes;
