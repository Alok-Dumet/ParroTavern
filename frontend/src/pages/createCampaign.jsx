import NProgress from 'nprogress';
import { useLocation } from 'react-router-dom';
import { useState, useRef } from 'react'; //allows me to track certain values and dynamically change them
import { useEffect } from 'react'; //allows me to run code after my components render
import TopBar from '../components/topBar';
import Preview from '../components/preview';
import Switch from '../components/switch';
import Confirmation from '../components/confirmation';
import './css/createCampaign.css';
import './css/layout1.css';

//HomePage Route
export default function CreateCampaign() {
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState(null);
  const [campaigns, setCampaigns] = useState([]);

  //posted information
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('/images/preview.png');
  const [campaignName, setCampaignName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setPrivacy] = useState(true);
  const [error, setError] = useState(null);

  //files are inherrently uncontrolled
  //so useRef must be used instead of useState and value to reset it to none
  const fileInput = useRef();

  //location change detection
  const location = useLocation();

  function toggleCampaignCreateOptions() {
    setImage(null);
    setCreating((prev) => !prev);
    setPreview('/images/preview.png');
    setCampaignName('');
    setDescription('');
    setPrivacy(true);
    setError(false);
    fileInput.current.value = null;
  }

  async function fetchCampaigns() {
    let res = await fetch('/myCampaigns');
    res = await res.json();

    let processed = res.campaigns.map((campaign) => {
      const byteArray = new Uint8Array(campaign.thumbNail.data.data); // extract bytes
      const blob = new Blob([byteArray], { type: campaign.thumbNail.contentType });
      const thumbNail = URL.createObjectURL(blob);
      return { ...campaign, thumbNail };
    });
    setCampaigns(() => processed);
    console.log('fetched campaigns');
  }

  async function createCampaign(event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append('image', image);
    formData.append('campaignName', campaignName);
    formData.append('description', description);
    formData.append('isPrivate', isPrivate);

    let options = {
      method: 'POST',
      body: formData,
    };
    let res = await fetch('/newCampaign', options);
    res = await res.json();
    if (!res.error) {
      fetchCampaigns();
      toggleCampaignCreateOptions();
    } else {
      setError(res.error);
    }
    console.log('Campaign created');
  }

  function deleteRequest(campaign) {
    setCampaignToDelete(campaign);
    setDeleting((prev) => !prev);
  }

  async function deleteCampaign(campaign) {
    let campaignName = campaign.campaignName;

    let options = {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignName: campaignName }),
    };
    let res = await fetch('/deleteCampaign', options);
    res = await res.json();
    if (!res.error) {
      fetchCampaigns();
    } else {
      console.log('Oopsie');
    }

    console.log('campaign deleted');
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setPreview(URL.createObjectURL(file)); //creates a temporary preview link
    }
  }

  useEffect(() => {
    async function loadData() {
      await fetchCampaigns();
      NProgress.done();
    }

    loadData();
  }, [location]);

  return (
    <div className="wholePage">
      <TopBar header={'Your Campaigns'} />

      <div className={creating ? 'creationContainer' : 'hidden'}>
        <form className="campaignCreateOptions" onSubmit={createCampaign}>
          <div className="campaignSection">
            <label className="previewContainer">
              <input
                type="file"
                accept="image/*"
                ref={fileInput}
                onChange={handleFileChange}
                className="hidden"
              />
              {preview && <img className="preview" src={preview} />}
            </label>
          </div>
          <div className="campaignSection">
            <h1>Campaign Name</h1>
            <input
              type="text"
              className="campaignNameTextBox"
              placeholder="Your Story Begins Here!"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
            />
          </div>
          <div className="campaignSection">
            <h1>{'Description'}</h1>
            <input
              type="text"
              className="campaignNameTextBox"
              placeholder="Let viewers get a rough idea of your story!"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="campaignSection">
            <h1>{'Privacy'}</h1>
            <Switch isPrivate={isPrivate} setPrivacy={setPrivacy} />
          </div>
          <input type="submit" className="campaignNameSubmit" value="Submit" />
          <input
            type="button"
            className="campaignNameClose"
            value="Cancel"
            onClick={toggleCampaignCreateOptions}
          />
          <div className={error ? 'error' : 'hidden'}> {error} </div>
        </form>
      </div>

      <div className={!creating ? 'mainContainer' : 'hidden'}>
        <div className="leftContainer">
          <button className="createButton" onClick={toggleCampaignCreateOptions}>
            Create
          </button>
        </div>

        <Confirmation
          message="delete Campaign"
          state={deleting}
          setState={setDeleting}
          action={() => {
            deleteCampaign(campaignToDelete);
            setCampaignToDelete(null);
          }}
        />

        <div className="centerContainer">
          {campaigns.map((campaign, index) => (
            <Preview key={index} campaign={campaign} deleteRequest={deleteRequest} />
          ))}
        </div>

        <div className="rightContainer"></div>
      </div>
    </div>
  );
}
