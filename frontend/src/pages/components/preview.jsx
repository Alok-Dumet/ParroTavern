import './css/preview.css';

export default function Preview({ campaign, visitCampaign, deleteRequest }) {
  return (
    <div data-name={campaign.campaignName} className="campaignContainer" onClick={visitCampaign}>
      <h2>{campaign.campaignName}</h2>
      <img src={campaign.thumbNail} className="preview"></img>
      <p>By: {campaign.dungeonMaster.userName}</p>
      {deleteRequest && (
        <h2 key={campaign.campaignName} className="deleteButton" onClick={(e)=>{
              e.stopPropagation();
              deleteRequest(campaign);
            }
          }>
          Delete
        </h2>
      )}
    </div>
  );
}
