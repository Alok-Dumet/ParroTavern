import {BrowserRouter} from 'react-router-dom'; //a container that enables React Router to change which page to display
import {Routes} from 'react-router-dom'; //a container for all my routes
import {Route} from 'react-router-dom'; //a component that'll render a specific page on a specific request
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Index from './pages/index.jsx';
import Profile from './pages/profile.jsx';
import Login from './pages/login.jsx';
import Register from './pages/register.jsx';
import CreateCampaign from './pages/createCampaign.jsx';
import CampaignPage from './pages/campaignPage.jsx';
import Stars from './components/stars';

import AppWrapper from './AppWrapper.jsx';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});


function App() {
  return (
    <>
      <Stars count={250} color={ "#5a0099"}/>
      <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppWrapper>
          <Routes>
            <Route path="/" element={<Index/>}/>
            <Route path="/profile/:userName" element={<Profile/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/register" element={<Register/>}/>
            <Route path="/createCampaign" element={<CreateCampaign/>} />
            <Route path="/campaign/:userName/:campaignName" element={<CampaignPage/>}/>
          </Routes>
        </AppWrapper>
      </BrowserRouter>
    </QueryClientProvider>
    </>
  );
}

export default App;
