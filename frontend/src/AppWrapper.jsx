import { useLocation } from 'react-router-dom'; //provides current URL path
import {useEffect} from "react";
import { useQuery } from '@tanstack/react-query';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import './pages/css/layout1.css';


export async function fetchSession(){
  let res = await fetch("/session");
  res = await res.json();
  return res;
}

//a Wrapper that lets me perform useEffect actions first before any other component can
export default function AppWrapper({ children }) {
    
  useQuery({
    queryKey: ['session'],
    queryFn: fetchSession,
    staleTime: Infinity,
    refetchOnMount: false,
    retry: false,
  });

  const location = useLocation();

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

      NProgress.remove();
      NProgress.start();
    }
  }, [location]);



  return(
    <>
      {children}
    </>
  );
}
