import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './css/loginRegister.css';

export default function Login() {
  const navigate = useNavigate();
  let [username, setUsername] = useState('');
  let [password, setPassword] = useState('');
  let [error, setError] = useState(null);

  //on submit, make an asynchronous call to check if login is succesful
  async function fetchLogin(event) {
    event.preventDefault();

    let options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username: username, password: password }),
    };

    let res = await fetch('/login', options);
    res = await res.json();

    if (!res.error) {
      setError(null);
      navigate('/');
    } else {
      setError(res.error);
    }
  }

  return (
    <div className="LoginRegisterPage">
      <img
        src="/images/ParroTavern.png"
        className="loginRegisterParroTavernIMG"
        alt="ParroTavern logo"
      />
      <div className="login">
        <h1> Login Below! </h1>
        <form onSubmit={fetchLogin}>
          <ul>
            <li>
              username:{' '}
              <input
                name="username"
                placeholder="Enter your username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </li>
            <li>
              password:{' '}
              <input
                name="password"
                placeholder="Enter your password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </li>
          </ul>
          <input type="submit" value="Log In" />
        </form>
        <h2>
          Don't Have an Account? <Link to="/register"> Register</Link>
        </h2>
        <div className={error ? 'error' : 'hidden'}>{error}</div>
      </div>
    </div>
  );
}
