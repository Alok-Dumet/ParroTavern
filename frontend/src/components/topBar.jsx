import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient} from '@tanstack/react-query';
import { fetchSelf } from "../AppWrapper.jsx";
import Confirmation from './confirmation';
import './css/topBar.css';

let pageLinks = [
  { anchor: '/profile', text: 'Profile' },
  { anchor: '/yourCampaigns', text: 'Your Campaigns'},
  { anchor: '/', text: 'Home'},
  { anchor: '/logout', text: 'Log Out'}
];

export default function TopBar({ header, username }) {
  const {data: self} = useQuery({
    queryKey: ['self'],
    queryFn: fetchSelf,
    staleTime: Infinity,
  });

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [hidden, setHidden] = useState(true);
  const [loggingOut, setLogOut] = useState(false);
  const sideBar = useRef();
  const icon = useRef();
  const logout = useRef();

  function toggleSidebar() {
    setHidden((prev) => !prev);
  }

  //logs user out
  async function fetchLogout() {
    let res = await fetch('/logout', {method: 'POST'});
    res = await res.json();
    if (res.logout) {
      queryClient.clear();
      navigate('/login', { replace: true });
    } else {
      console.log("we couldn't logout");
    }
    setLogOut((prev) => !prev);
  }

  useEffect(()=>{
    function clickOutside(event){
      if (!hidden && !sideBar.current.contains(event.target) && !icon.current.contains(event.target) && !logout.current.contains(event.target)) {
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

      <div ref={logout}>
        <Confirmation
          message="log out"
          state={loggingOut}
          setState={setLogOut}
          action={fetchLogout}
        />
      </div>

      <div className={`sideBar ${!hidden ? 'visible' : ''}`} ref={sideBar}>
        {pageLinks.map((link, index) => {
          if (link.anchor === '/profile') {
            return (
              <div
                key={index}
                onClick={() => navigate('/profile/' + encodeURIComponent(self.user.userName))}
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
          } else{
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
