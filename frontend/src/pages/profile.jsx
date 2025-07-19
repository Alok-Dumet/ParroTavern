import NProgress from 'nprogress';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TopBar from '../components/topBar';
import './css/profile.css';
import './css/layout1.css';

export default function Profile() {
  const { userName } = useParams();
  const [user, setUser] = useState({ userName: '', email: '' });
  const location = useLocation();

  async function fetchSession() {
    let res = await fetch('/userData/' + encodeURIComponent(userName));
    res = await res.json();
    setUser(res.user);
  }

  //fetch session data
  useEffect(() => {
    async function loadData() {
      await fetchSession();
    }
    loadData();
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
