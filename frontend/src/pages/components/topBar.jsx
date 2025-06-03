import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Confirmation from './confirmation';
import './css/topBar.css';

let pageLinks = [
  { anchor: '/profile', text: 'Profile' },
  { anchor: '/createCampaign', text: 'Your Campaigns' },
  { anchor: '/', text: 'Home' },
  { anchor: '/logout', text: 'Log Out' },
];

export default function TopBar({ header, username }) {
  const navigate = useNavigate();
  const [hidden, setHidden] = useState(false);
  const [loggingOut, setLogOut] = useState(false);

  function toggleSidebar() {
    setHidden((prev) => !prev);
  }

  async function handleClick() {
    let res = await fetch('/session');
    res = await res.json();
    console.log('/profile/' + encodeURIComponent(res.user.userName));
    navigate('/profile/' + encodeURIComponent(res.user.userName));
  }

  //logs user out
  async function fetchLogout() {
    let res = await fetch('/logout');
    res = await res.json();
    if (res.logout) {
      navigate('/login');
    } else {
      console.log("we couldn't logout");
    }
    setLogOut((prev) => !prev);
  }

  return (
    <>
      <div className="topbar">
        <div className="campaignIdentityContainer">
          <h1>{header}</h1>
          {username && (
            <Link to={'/profile/' + encodeURIComponent(username)} className="user">
              {'Dungeon Master: ' + username}
            </Link>
          )}
        </div>
        <img
          src="/images/ParroTavernMini.png"
          className="homeParroTavernIMG"
          alt="ParroTavern logo"
          onClick={toggleSidebar}
        />
      </div>

      <Confirmation
        message="log out"
        state={loggingOut}
        setState={setLogOut}
        action={fetchLogout}
      />

      <div className={hidden ? 'sideBar' : 'hidden'}>
        {pageLinks.map((link, index) => {
          if (link.anchor === '/profile') {
            return (
              <div key={index} onClick={() => handleClick()}>
                {link.text}
              </div>
            );
          } else if (link.anchor === '/logout') {
            return (
              <div key={index} onClick={() => setLogOut((prev) => !prev)}>
                {link.text}
              </div>
            );
          } else {
            return (
              <Link key={index} to={link.anchor}>
                {link.text}
              </Link>
            );
          }
        })}
      </div>
    </>
  );
}
