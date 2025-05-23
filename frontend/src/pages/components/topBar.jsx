import { Link } from 'react-router-dom';
import { useState } from 'react';
import './css/topBar.css';

let pageLinks = [
  { anchor: '/profile', text: 'Profile' },
  { anchor: '/createCampaign', text: 'Your Campaigns' },
  { anchor: '/', text: 'Home' },
];

export default function TopBar({ header, username }) {
  const [hidden, setHidden] = useState(false);

  function toggleSidebar() {
    setHidden((prev) => !prev);
  }

  return (
    <>
      <div className="topbar">
        <h1>{header}</h1>
        {username && <div className="user">{'Dungeon Master ' + username}</div>}
        <img
          src="/images/ParroTavernMini.png"
          className="homeParroTavernIMG"
          alt="ParroTavern logo"
          onClick={toggleSidebar}
        />
      </div>

      <div className={hidden ? 'sideBar' : 'hidden'}>
        {pageLinks.map((link, index) => {
          return (
            <Link key={index} to={link.anchor}>
              {link.text}
            </Link>
          );
        })}
      </div>
    </>
  );
}
