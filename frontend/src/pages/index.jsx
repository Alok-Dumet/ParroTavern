import { useState } from 'react'; //allows me to track certain values and dynamically change them
import {useEffect} from "react"; //allows me to run code after my components render
import {useNavigate} from "react-router-dom"; //alows me navigation between pages without reloading
import TopBar from "./components/topBar";
import './css/index.css';
import "./css/layout1.css";

//HomePage Route
export default function Index() {
  const [user, setUser] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const navigate = useNavigate();

  //fetches all public campaigns
  async function fetchPublicCampaigns(){
    let res = await fetch("/publicCampaigns");
    res = await res.json();
    setCampaigns((prev) => (res.campaigns));
    console.log(res.campaigns);
  }

  //visits a campaign when clicked on
  function visitCampaign(event){
    const name = encodeURIComponent(event.currentTarget.dataset.name);
    const dungeonMaster = encodeURIComponent(event.currentTarget.dataset.dungeonmaster);
    console.log(dungeonMaster);
    navigate("/createCampaign/"+ dungeonMaster +"/" + name);
  }  


  //fetch user session and public campaigns
  useEffect(()=>{
    async function fetchSession(){
        let res = await fetch("/session");
        res = await res.json();
        setUser(res.user);
    }
    fetchSession();
    fetchPublicCampaigns();
  },[])

  let header = "Welcome To ParroTavern"
  return (
    <div className="wholePage">
      <TopBar header={header} />


      <div className="mainContainer">
        
        <div className="leftContainer">
        </div>

        <div className="centerContainer">
          {campaigns.map((campaign, index)=>(
            <div key={index} data-dungeonmaster={campaign.dungeonMaster.userName} data-name={campaign.campaignName} className="campaignContainer" onClick={visitCampaign}>
              <h2>{campaign.campaignName}</h2>
              <p>By: {campaign.dungeonMaster.userName}</p>
            </div>
          ))}
        </div>

        <div className="rightContainer">
        </div>

      </div>
    </div>
  );
}