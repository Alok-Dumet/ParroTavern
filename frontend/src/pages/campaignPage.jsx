import { useState } from 'react'; //allows me to track certain values and dynamically change them
import {useEffect} from "react"; //allows me to run code after my components render
import {useNavigate} from "react-router-dom"; //alows me navigation between pages without reloading
import { useParams } from "react-router-dom"; //allows me to use the parameters in the url
import "./css/layout1.css";
import TopBar from "./components/topBar";

//HomePage Route
export default function CampaignPage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { userName, campaignName } = useParams();

  useEffect(()=>{
    async function fetchSession(){
        let res = await fetch("/session");
        res = await res.json();
        setUser(res.user);
    }
    fetchSession();
  },[])

  let header = campaignName

  
  return (
    <div className="wholePage">
          <TopBar header={header} username={userName} />
    </div>
  );
}