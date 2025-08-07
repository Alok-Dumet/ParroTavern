import NProgress from 'nprogress';
import { useLocation, useParams } from 'react-router-dom';
import { useState, useEffect} from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSelf } from "../AppWrapper.jsx";
import TopBar from '../components/topBar';
import './css/profile.css';
import './css/layout1.css';

export default function Profile() {
  const { data: self} = useQuery({
    queryKey: ['self'],
    queryFn: fetchSelf,
    staleTime: Infinity,
  });
  const { userName } = useParams();
  const location = useLocation();
  const [user, setUser] = useState({ userName: '', email: '' });
  const [sameUser, setSameUser] = useState(false);

  async function fetchProfile() {
    let res = await fetch('/users/' + encodeURIComponent(userName));
    res = await res.json();
    setUser(res.user);
    setSameUser(false);
    console.log("fetched from fetchProfile function")
    NProgress.done();
  }

  //fetch self (the active user) data
  useEffect(() => {
    if (!self) return;
    
    if (self.user.userName === userName) {
      setUser(self.user);
      setSameUser(true);
      setTimeout(() => NProgress.done(), 100);
    }
    else{
      async function loadData() {
        await fetchProfile();
      }
      loadData();
    }
  }, [location, self]);

  return (
    <>
      <div className="wholePage">
        <TopBar header={userName} />
        <div className="profileContainer">
          <h1>Welcome</h1>
          <div className="profileDetails">
            <div className="userDetail"><div>Username</div><div>{user.userName}</div></div>
            {sameUser && 
              <div className="userDetail"><div>Email</div><div>{user.email}</div></div>
            }
          </div>
        </div>
      </div>
    </>
  );
}
