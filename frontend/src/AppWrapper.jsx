import { useLocation } from 'react-router-dom'; //provides current URL path
import { createContext, useContext, useState, useEffect } from "react";
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import './pages/css/layout1.css';

const UserContext = createContext(null);

export function useUser() {
  return useContext(UserContext);
}

//a Wrapper that lets me perform useEffect actions first before any other component can
export default function AppWrapper({ children }) {
  const [user, setUser] = useState(null);
  const location = useLocation();

  //Fetches session data for the user
  async function fetchSession() {
    let res = await fetch("/session");
    res = await res.json();
    setUser(res.user);
  }

  //paths to ignore fetching data and showing load bar
  const fetchlessPaths = [/^\/login$/, /^\/register$/]

  //starts load bar and checks if a user currently exists before fetching user data
  useEffect(() => {
    if(!fetchlessPaths.some((elem)=>elem.test(location.pathname))){
      NProgress.configure({
      showSpinner: false,
      trickleSpeed: 300,
      speed: 400
      });

      // NProgress.remove();
      // NProgress.start();
      if(!user) fetchSession();
    }
  }, [location]);

  return(
    <UserContext.Provider value={{user,setUser }}>
        {children}
    </UserContext.Provider>
  );
}
