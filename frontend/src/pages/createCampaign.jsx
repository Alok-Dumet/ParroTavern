import { useLocation } from 'react-router-dom';
import { useState, useRef } from 'react'; //allows me to track certain values and dynamically change them
import { useEffect } from 'react'; //allows me to run code after my components render
import TopBar from '../components/topBar';
import Preview from '../components/preview';
import Switch from '../components/switch';
import Confirmation from '../components/confirmation';
import './css/createCampaign.css';
import './css/layout1.css';
import NProgress from 'nprogress';

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

  async function fetchCampaigns(){
    let data = await fetch('/campaigns?owned=true');
    data = await data.json();
    return data.campaigns;
  }

  function toggleCampaignCreateOptions() {
    setImage(null);
    setCreating((prev) => !prev);
    setPreview('/images/preview.png');
    setCampaignName('');
    setDescription('');
    setPrivacy(true);
    setError(false);
    if(fileInput.current) fileInput.current.value = null;
  }

  async function createCampaign(event) {
    event.preventDefault();
    NProgress.remove();
    NProgress.start();

    const formData = new FormData();
    formData.append('image', image);
    formData.append('campaignName', campaignName);
    formData.append('description', description);
    formData.append('isPrivate', isPrivate);

    let options = {
      method: 'POST',
      body: formData,
    };
    let res = await fetch('/campaigns', options);
    res = await res.json();
    if (!res.error) {
      const reloadedData = await fetchCampaigns();
      setCampaigns(reloadedData);
      toggleCampaignCreateOptions();
      console.log('Campaign created');
    } else {
      setError(res.error);
    }
    NProgress.done();
  }

  function deleteRequest(campaign) {
    setCampaignToDelete(campaign);
    setDeleting((prev) => !prev);
  }

  async function deleteCampaign(campaign) {
    NProgress.remove();
    NProgress.start();
    const campaignName = campaign.campaignName;
    const campaignId = campaign._id;

    let options = {
      method: 'DELETE'
    };

    let res = await fetch(`/campaigns/${campaignId}`, options);
    res = await res.json();
    if (!res.error) {
      const reloadedData = await fetchCampaigns();
      setCampaigns(reloadedData);
      NProgress.done();
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
      let campaigns = await fetchCampaigns();
      setCampaigns(campaigns);
      NProgress.done();
    }
    if(creating) toggleCampaignCreateOptions();
    loadData();
  }, [location]);

  return (
    <>
      <div className="wholePage">
        <TopBar header={'Your Campaigns'} />

        {creating && <div className='creationContainer'>
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
                className="campaignTextBox"
                placeholder="Your Story Begins Here!"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                maxLength="50"
                required
              />
              <div className="wordCount"> <div>{campaignName.length}/50</div> </div>
            </div>
            <div className="campaignSection">
              <h1>Description</h1>
              <input
                type="text"
                className="campaignTextBox"
                placeholder="Let viewers get a rough idea of your story!"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength="400"
              />
              <div className="wordCount"> <div>{description.length}/400</div> </div>
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
            {error && <div className='error'> {error} </div>}
          </form>
        </div>}

        {!creating && <div className='mainContainer'>
          <div className="leftContainer">
            <button className="createButton" onClick={toggleCampaignCreateOptions}>
              Create
            </button>
          </div>

          <Confirmation
            message="delete this?"
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
        </div>}
      </div>
    </>
  );
}
