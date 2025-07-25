import NProgress from 'nprogress';
import { useLocation, useParams } from 'react-router-dom';
import { useState, useEffect} from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSession } from "../AppWrapper.jsx";
import TopBar from '../components/topBar';
import './css/profile.css';
import './css/layout1.css';

export default function Profile() {
  const { data: session} = useQuery({
    queryKey: ['session'],
    queryFn: fetchSession,
    staleTime: Infinity,
  });

  const { userName } = useParams();
  const [user, setUser] = useState({ userName: '', email: '' });
  const location = useLocation();

  async function fetchProfile() {
    let res = await fetch('/userData/' + encodeURIComponent(userName));
    res = await res.json();
    setUser(res.user);
    console.log("fetched down here")
    NProgress.done();
  }

  //fetch session data
  useEffect(() => {
    if(!session){
      async function loadData() {
        await fetchProfile();
      }
      loadData();
    }
    else{
      setUser(session.user);
      setTimeout(() => NProgress.done(), 100);
    }
  }, [location]);

  return (
    <div className="wholePage">
      <TopBar header={userName} />

      <div className="profileContainer">
        <h1>Welcome</h1>
        <div className="profileDetails">
          <ul>
            <li>
              Username: {user.userName}
            </li>
            <li>
              Email: {user.email}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
