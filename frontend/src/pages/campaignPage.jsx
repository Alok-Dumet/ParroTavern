import NProgress from 'nprogress';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom'; //allows me to use the parameters in the url
import './css/layout1.css';
import TopBar from '../components/topBar';
import DraggableBox from '../components/draggableBox';

//HomePage Route
export default function CampaignPage() {
  const location = useLocation();
  const { userName, campaignName } = useParams();

  useEffect(() => {
    NProgress.done();
  }, [location]);

  return (
    <div className="wholePage">
      <TopBar header={campaignName} username={userName} />
      <div className="mainContainer">
        <div className="leftContainer"></div>

        <div className="centerContainer">
          <DraggableBox />
        </div>

        <div className="rightContainer"></div>
      </div>
    </div>
  );
}
