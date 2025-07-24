import NProgress from 'nprogress';
import { useLocation, useParams } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import {UserContext} from "../AppWrapper";
import TopBar from '../components/topBar';
import './css/profile.css';
import './css/layout1.css';

export default function Profile() {
  const { userName } = useParams();
  const {user: storedUser, setUser: setStoredUser} = useContext(UserContext);
  const [user, setUser] = useState({ userName: '', email: '' });
  const location = useLocation();

  async function fetchSession() {
    let res = await fetch('/userData/' + encodeURIComponent(userName));
    res = await res.json();
    setUser(res.user);
    setStoredUser(res.user)
    console.log("fetched down here")
    NProgress.done();
  }

  //fetch session data
  useEffect(() => {
    if(!storedUser){
      async function loadData() {
        await fetchSession();
      }
      loadData();
    }
    else{
      setUser(storedUser);
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
