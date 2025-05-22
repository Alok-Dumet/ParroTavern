import { useState } from 'react'; //allows me to track certain values and dynamically change them
import { useEffect } from 'react'; //allows me to run code after my components render
import { useNavigate } from 'react-router-dom'; //alows me navigation between pages without reloading
import TopBar from './components/topBar';
import './css/createCampaign.css';
import './css/layout1.css';

//HomePage Route
export default function CreateCampaign() {
  const [user, setUser] = useState(null);
  const [creating, setCreating] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  //posted information
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('/images/preview.png');
  const [campaignName, setCampaignName] = useState('');
  const [description, setDescription] = useState(false);
  const [isPrivate, setPrivacy] = useState(true);

  let [error, setError] = useState(null);
  const navigate = useNavigate();

  function toggleCampaignCreateOptions() {
    setCreating((prev) => !prev);
    setPreview('/images/preview.png');
    setDescription('');
    setCampaignName('');
    setPrivacy(true);
    setError(false);
  }

  async function fetchCampaigns() {
    let res = await fetch('/myCampaigns');
    res = await res.json();
    setCampaigns(() => res.campaigns);
    console.log(res.campaigns);
  }

  async function createCampaign(event) {
    console.log(image, 'sendeadjasdn');
    event.preventDefault();

    const formData = new FormData();
    formData.append('image', image);
    formData.append('campaignName', campaignName);
    formData.append('description', description);
    formData.append('isPrivate', isPrivate);

    let options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: formData,
      credentials: 'include',
    };
    let res = await fetch('/newCampaign', options);
    res = await res.json();
    if (!res.error) {
      toggleCampaignCreateOptions();
      fetchCampaigns();
    } else {
      setError(res.error);
    }
  }

  async function deleteCampaign(event) {
    event.stopPropagation();
    let campaignName = event.target.parentElement.dataset.name;
    console.log(campaignName);

    let options = {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignName: campaignName }),
      credentials: 'include',
    };
    let res = await fetch('/deleteCampaign', options);
    res = res.json();
    if (!res.error) {
      fetchCampaigns();
    } else {
      console.log('Oopsie');
    }
  }

  function visitCampaign(event) {
    const name = encodeURIComponent(event.currentTarget.dataset.name);
    navigate('/createCampaign/' + user.userName + '/' + name);
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setPreview(URL.createObjectURL(file)); //creates a temporary preview link
    }
  }

  useEffect(() => {
    async function fetchSession() {
      let res = await fetch('/session');
      res = await res.json();
      setUser(res.user);
    }
    fetchCampaigns();
    fetchSession();
  }, []);

  let header = 'Your Campaigns';
  return (
    <div className="wholePage">
      <TopBar header={header} />

      <div className={creating ? 'creationContainer' : 'hidden'}>
        <form className="campaignCreateOptions" onSubmit={createCampaign}>
          <div className="campaignSection">
            <label className="previewContainer">
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              {preview && <img className="preview" src={preview} />}
            </label>
          </div>
          <div className="campaignSection">
            <h1>Campaign Name</h1>
            <input
              type="text"
              className="campaignNameTextBox"
              placeholder="Your Story Begins Here!"
              onChange={(e) => setCampaignName(e.target.value)}
            />
          </div>
          <div className="campaignSection">
            <h1>{'Description'}</h1>
            <input
              type="text"
              className="campaignNameTextBox"
              placeholder="Let viewers get a rough idea of your story!"
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="campaignSection">
            <h1>{'Privacy'}</h1>
            <label className="switch">
              <input
                type="checkbox"
                checked={!isPrivate}
                onChange={() => setPrivacy((prev) => !prev)}
              />
              <span className="slider" />
            </label>
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

        <div className="centerContainer">
          {campaigns.map((campaign, index) => (
            <div
              key={index}
              data-name={campaign.campaignName}
              className="campaignContainer"
              onClick={visitCampaign}
            >
              <h2>{campaign.campaignName}</h2>
              <h2 key={campaign.campaignName} className="deleteButton" onClick={deleteCampaign}>
                Delete
              </h2>
            </div>
          ))}
        </div>

        <div className="rightContainer"></div>
      </div>
    </div>
  );
}
