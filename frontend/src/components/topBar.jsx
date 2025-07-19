import { useNavigate } from 'react-router-dom';
import NProgress from 'nprogress';
import { useState, useEffect, useRef } from 'react';
import Confirmation from './confirmation';
import { useUser} from '../AppWrapper';
import './css/topBar.css';


export async function fetchPublic(){
  let data = await fetch("/publicCampaigns");
  data = await data.json();
  let processed = data.campaigns.map((campaign) => {
    const byteArray = new Uint8Array(campaign.thumbNail.data.data); // extract bytes
    const blob = new Blob([byteArray], { type: campaign.thumbNail.contentType });
    const thumbNail = URL.createObjectURL(blob);
    return { ...campaign, thumbNail };
  });
  return processed;
}

export async function fetchCampaigns(){
    let data = await fetch('/myCampaigns');
    data = await data.json();
    let processed = data.campaigns.map((campaign) => {
      const byteArray = new Uint8Array(campaign.thumbNail.data.data); // extract bytes
      const blob = new Blob([byteArray], { type: campaign.thumbNail.contentType });
      const thumbNail = URL.createObjectURL(blob);
      return { ...campaign, thumbNail };
    });
  return processed;
}

let pageLinks = [
  { anchor: '/profile', text: 'Profile' },
  { anchor: '/createCampaign', text: 'Your Campaigns', fetchFunc: fetchCampaigns },
  { anchor: '/', text: 'Home', fetchFunc: fetchPublic},
  { anchor: '/logout', text: 'Log Out'}
];

export default function TopBar({ header, username }) {
  const navigate = useNavigate();
  const [hidden, setHidden] = useState(true);
  const [loggingOut, setLogOut] = useState(false);
  const { user, setUser } = useUser();
  const sideBar = useRef();
  const icon = useRef();
  const logout = useRef();

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

  async function nextPage(anchor, fetchFunction){
    NProgress.remove();
    NProgress.start()
    if(fetchFunction){
      let data = await fetchFunction();
      NProgress.done();
      navigate(anchor, {state:{data}});
    }
    else{
      NProgress.done();
      navigate(anchor);
    }
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
                onClick={() => nextPage('/profile/' + encodeURIComponent(user.userName))}
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
              <div key={index} onClick={()=>nextPage(link.anchor, link.fetchFunc)}>
                {link.text}
              </div>
            );
          }
        })}
      </div>
    </>
  );
}
