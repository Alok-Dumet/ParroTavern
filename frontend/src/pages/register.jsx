import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './css/loginRegister.css';

export default function Register() {
  const navigate = useNavigate();
  let [username, setUsername] = useState('');
  let [password, setPassword] = useState('');
  let [email, setEmail] = useState('');
  let [error, setError] = useState(null);

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
      navigate('/');
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
      </div>
    </>
  );
}
