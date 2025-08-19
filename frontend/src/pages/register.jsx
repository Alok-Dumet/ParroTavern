import { useState } from 'react';
import { Link } from 'react-router-dom';
import './css/loginRegister.css';

export default function Register() {
  let [username, setUsername] = useState('');
  let [password, setPassword] = useState('');
  let [email, setEmail] = useState('');
  let [error, setError] = useState(null);
  let [verifyNotif, setVerifyNotif] = useState(false);

  //on register, make an asynchronous call to check if register is succesful
  async function fetchRegister(event) {
    event.preventDefault();

    let options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username, password: password, email: email }),
    };

    let res = await fetch('/register', options);
    res = await res.json();

    if (!res.error) {
      setError(null);
      setVerifyNotif(true);
      setTimeout(() => {setVerifyNotif(false);}, 10000);
    } else {
      setError(res.error);
    }
  }

  return (
    <>
      <div className="LoginRegisterPage">
        <img
          src="/images/ParroTavern.png"
          className="loginRegisterParroTavernIMG"
          alt="ParroTavern logo"
        />
        <div className="register">
          <h1> Register Below! </h1>
          <form onSubmit={fetchRegister}>
            <ul>
              <li>
                username:
                <input
                  name="username"
                  placeholder="Enter your username"
                  type="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength="2"
                  maxLength="32"
                  pattern="^[a-zA-Z0-9_]+$"
                  title="Usernames must be 2-32 characters long and contain only letters, numbers, and underscores."
                />
              </li>
              <li>
                password:
                <input
                  name="password"
                  placeholder="Enter your password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </li>
              <li>
                email:
                <input
                  name="email"
                  placeholder="Enter your email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  minLength="5"
                  maxLength="254"
                  pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                  title="Email must be 5-254 characters long and contain an @ and a period."
                />
              </li>
            </ul>
            <input type="submit" value="Register" />
          </form>
          <h2>
            Already Have an Account? <Link to="/login"> Log In</Link>
          </h2>
          {error && <div className='error'> {error} </div>}
        </div>
        {verifyNotif && ( <div className='verifyNotif'> <div> <div>Check your email to verify your account!</div> </div> </div>
        )}
      </div>
    </>
  );
}
