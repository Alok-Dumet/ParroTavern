import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import Confirmation from './confirmation';
import { useUser } from '../AppWrapper';
import './css/topBar.css';

let pageLinks = [
  { anchor: '/profile', text: 'Profile' },
  { anchor: '/createCampaign', text: 'Your Campaigns' },
  { anchor: '/', text: 'Home' },
  { anchor: '/logout', text: 'Log Out' },
];

export default function TopBar({ header, username }) {
  const navigate = useNavigate();
  const [hidden, setHidden] = useState(true);
  const [loggingOut, setLogOut] = useState(false);
  const { user, setUser } = useUser();
  const sideBar = useRef();
  const icon = useRef();

  function toggleSidebar() {
    setHidden((prev) => !prev);
  }

  //logs user out
  async function fetchLogout() {
    let res = await fetch('/logout');
    res = await res.json();
    if (res.logout) {
      setUser(null);
      navigate('/login');
    } else {
      console.log("we couldn't logout");
    }
    setLogOut((prev) => !prev);
  }

  useEffect(()=>{
    function clickOutside(event){
      if (!hidden && !sideBar.current.contains(event.target) && !icon.current.contains(event.target)) {
        setHidden(true); // Close sidebar if clicking outside of it
      }
    }
    document.addEventListener("mousedown", clickOutside);

    //cleanup function. it doesn't run immediately, it runs at the beginning of the next useEffect
    return () => {
      document.removeEventListener('mousedown', clickOutside);
    };
  } , [hidden])

  return (
    <>
      <div className="topbar">
        <div className="campaignIdentityContainer">
          <h1>{header}</h1>
          {username && (
            <div onClick={()=>navigate('/profile/' + encodeURIComponent(username))} className="user">
              {'Dungeon Master: ' + username}
            </div>
          )}
        </div>
        <img
          src="/images/ParroTavernMini.png"
          className="homeParroTavernIMG"
          alt="ParroTavern logo"
          onClick={toggleSidebar}
          ref={icon}
        />
      </div>

      <Confirmation
        message="log out"
        state={loggingOut}
        setState={setLogOut}
        action={fetchLogout}
      />

      <div className={`sideBar ${!hidden ? 'visible' : ''}`} ref={sideBar}>
        {pageLinks.map((link, index) => {
          if (link.anchor === '/profile') {
            return (
              <div
                key={index}
                onClick={() => navigate('/profile/' + encodeURIComponent(user.userName))}
              >
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
              <div key={index} onClick={()=>navigate(link.anchor)}>
                {link.text}
              </div>
            );
          }
        })}
      </div>
    </>
  );
}
