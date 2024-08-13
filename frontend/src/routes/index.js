import { useRoutes } from 'react-router-dom';

// import MainRoutes from './MainRoutes';
import AuthenticationRoutes from './AuthenticationRoutes';
import AnotherMainRoutes from './routers';

export default function ThemeRoutes() {
  return useRoutes([AuthenticationRoutes, AnotherMainRoutes]);
}
