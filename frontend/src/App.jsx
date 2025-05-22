import {BrowserRouter} from 'react-router-dom'; //a container that enables React Router to change which page to display
import {Routes} from 'react-router-dom'; //a container for all my routes
import {Route} from 'react-router-dom'; //a component that'll render a specific page on a specific request
import Index from './pages/index.jsx';
import Profile from './pages/profile.jsx';
import Login from './pages/login.jsx';
import Register from './pages/register.jsx';
import CreateCampaign from './pages/createCampaign.jsx';
import CampaignPage from './pages/campaignPage.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index/>}/>
        <Route path="/profile" element={<Profile/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/createCampaign" element={<CreateCampaign/>} />
        <Route path="/createCampaign/:userName/:campaignName" element={<CampaignPage/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
