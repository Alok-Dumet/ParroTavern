import { useState } from 'react'; //allows me to track certain values and dynamically change them
import { useEffect } from 'react'; //allows me to run code after my components render
import { useNavigate } from 'react-router-dom'; //alows me navigation between pages without reloading
import TopBar from './components/topBar';
import Preview from './components/preview';
import './css/index.css';
import './css/layout1.css';

//HomePage Route
export default function Index() {
  const [campaigns, setCampaigns] = useState([]);
  const navigate = useNavigate();

  //fetches all public campaigns
  async function fetchPublicCampaigns() {
    let res = await fetch('/publicCampaigns');
    res = await res.json();
    let processed = res.campaigns.map((campaign) => {
      const byteArray = new Uint8Array(campaign.thumbNail.data.data); // extract bytes
      const blob = new Blob([byteArray], { type: campaign.thumbNail.contentType });
      const thumbNail = URL.createObjectURL(blob);
      return { ...campaign, thumbNail };
    });
    setCampaigns(() => processed);
    console.log(res.campaigns);
  }

  //visits a campaign when clicked on
  function visitCampaign(event) {
    const name = encodeURIComponent(event.currentTarget.dataset.name);
    const dungeonMaster = encodeURIComponent(event.currentTarget.dataset.dungeonmaster);
    console.log(dungeonMaster);
    navigate('/createCampaign/' + dungeonMaster + '/' + name);
  }

  //fetch user session and public campaigns
  useEffect(() => {
    fetchPublicCampaigns();
  }, []);

  let header = 'Welcome To ParroTavern';
  return (
    <div className="wholePage">
      <TopBar header={header} />

      <div className="mainContainer">
        <div className="leftContainer"></div>

        <div className="centerContainer">
          {campaigns.map((campaign, index) => (
            <Preview key={index} campaign={campaign} visitCampaign={visitCampaign} />
          ))}
        </div>

        <div className="rightContainer"></div>
      </div>
    </div>
  );
}
