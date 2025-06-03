import { useLocation } from 'react-router-dom'; //provides current URL path
import { useEffect } from 'react'; //will be used to trigger load bar on path change
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import './pages/css/layout1.css';

export default function AppWrapper({ children }) {
  const location = useLocation();

  const fetchlessPaths = [/^\/login$/, /^\/register$/]

  useEffect(() => {
    if(!fetchlessPaths.some((elem)=>elem.test(location.pathname))){
      NProgress.configure({
      showSpinner: false,
      trickleSpeed: 300,
      speed: 400
      });

      NProgress.remove();
      NProgress.start();
    }
  }, [location]);

  return <>{children}</>;
}
