import { useLocation } from 'react-router-dom';
import { useState } from 'react'; //allows me to track certain values and dynamically change them
import { useEffect } from 'react'; //allows me to run code after my components render
import TopBar from '../components/topBar';
import {fetchPublic} from '../components/topBar';
import Preview from '../components/preview';
import './css/index.css';
import './css/layout1.css';

//HomePage Route
export default function Index() {
  const [campaigns, setCampaigns] = useState([]);
  const location = useLocation();

  //fetch public campaigns
  useEffect(() => {
    async function loadData() {
      if (!location.state){
        console.log("refetched")
        let campaigns = await fetchPublic();
        setCampaigns(campaigns);
      }
      else{
        console.log("from navigate")
        setCampaigns(location.state.data);
      }
    }
    loadData();


  }, [location]);

  return (
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
  );
}
