import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './css/verification.css';

export default function Verification() {
  const {token} = useParams();
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function verifyEmail() {
    let res = await fetch(`/verify/${token}`, {method: 'POST'});
    res = await res.json();
    if(!res.error){
      setError("Your email has been verified! You can now log in.");
      navigate("/");
    }
    else{
      setError("This verification link has expired. Please try again faster!");
    }
  }

  useEffect(() => {
    verifyEmail();
  }, []);

  return (
    <>
      <div className="VerificationPage">
        <img
          src="/images/ParroTavern.png"
          className="loginRegisterParroTavernIMG"
          alt="ParroTavern logo"
        />
        <div className="verificationContainer">
          {error && <div className='error'> {error} </div>}
        </div>
      </div>
    </>
  );
}
