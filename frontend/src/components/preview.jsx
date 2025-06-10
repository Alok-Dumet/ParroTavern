import './css/preview.css';
import { useNavigate } from 'react-router-dom';

export default function Preview({ campaign, deleteRequest }) {
  const navigate = useNavigate();

  // visits a campaign when clicked on
  function visitCampaign(event) {
    const campaignName = encodeURIComponent(event.currentTarget.dataset.name);
    const userName = encodeURIComponent(event.currentTarget.dataset.user);
    navigate('/campaign/' + userName + '/' + campaignName);
  }

  function handleClick(e) {
    e.stopPropagation();
    navigate('/profile/' + encodeURIComponent(campaign.dungeonMaster.userName));
  }

  return (
    <div
      data-name={campaign.campaignName}
      data-user={campaign.dungeonMaster.userName}
      className="campaignContainer"
      onClick={visitCampaign}
    >
      <h2>{campaign.campaignName}</h2>
      <p onClick={handleClick}>By: {campaign.dungeonMaster.userName}</p>
      <img src={campaign.thumbNail} className="preview"></img>
      {deleteRequest && (
        <h2
          key={campaign.campaignName}
          className="deleteButton"
          onClick={(e) => {
            e.stopPropagation();
            deleteRequest(campaign);
          }}
        >
          Delete
        </h2>
      )}
    </div>
  );
}
