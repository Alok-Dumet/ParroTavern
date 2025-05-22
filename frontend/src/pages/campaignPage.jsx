import { useParams } from 'react-router-dom'; //allows me to use the parameters in the url
import './css/layout1.css';
import TopBar from './components/topBar';

//HomePage Route
export default function CampaignPage() {
  // const navigate = useNavigate();
  const { userName, campaignName } = useParams();

  let header = campaignName;

  return (
    <div className="wholePage">
      <TopBar header={header} username={userName} />
    </div>
  );
}
