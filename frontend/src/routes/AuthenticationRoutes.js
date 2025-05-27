import { lazy } from 'react';
// project imports
import Loadable from '../components/Loadable';
import MinimalLayout from '../layouts/MinimalLayout';
import { Navigate } from 'react-router';

// login option 3 routing
const AuthLogin3 = Loadable(lazy(() => import('../Website/pages/authentication/authentication3/Login3')));
const AuthRegister3 = Loadable(lazy(() => import('../Website/pages/authentication/authentication3/Register3')));

// ==============================|| AUTHENTICATION ROUTING ||============================== //

const AuthenticationRoutes = {
    path: '/',
    element: <MinimalLayout />,
    children: [
        {
            path: '/',
            element: <Navigate to="/home" />
          },
          {
            path: 'login',
            element: <AuthLogin3 />
          },
        {
            path: 'register',
            element: <AuthRegister3 />
        }
    ]
};

export default AuthenticationRoutes;
