import { useLocation } from 'react-router-dom';
import { useState } from 'react'; //allows me to track certain values and dynamically change them
import { useEffect } from 'react'; //allows me to run code after my components render
import TopBar from '../components/topBar';
import Preview from '../components/preview';
import './css/index.css';
import './css/layout1.css';
import NProgress from 'nprogress';


//HomePage Route
export default function Index() {
  const [campaigns, setCampaigns] = useState([]);
  const location = useLocation();

  async function fetchPublic(){
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

  //fetch public campaigns
  useEffect(() => {
    async function loadData() {
      const campaigns = await fetchPublic();
      setCampaigns(campaigns);
      NProgress.done();
    }
    loadData();


  }, [location]);

  return (
  <>
    <div className="wholePage">
      <TopBar header={'Welcome To ParroTavern'} />

      <div className="mainContainer">
        <div className="leftContainer"></div>

        <div className="centerContainer">
          {campaigns.map((campaign, index) => (
            <Preview key={index} campaign={campaign} />
          ))}
        </div>

        <div className="rightContainer"></div>
      </div>
    </div>
  </>
  );
}
