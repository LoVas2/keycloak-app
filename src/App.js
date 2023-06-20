import React, { useState, useEffect } from 'react';
import { Buffer } from 'buffer';
import './App.css';
import UserService from './services/UserService';

function App() {

  console.log('init APP');

  function getExp(token) {
    const parsedJwt = parseJwt(token);
    var date = new Date(parsedJwt.exp * 1000);
    // Hours part from the timestamp
    var hours = date.getHours();
    // Minutes part from the timestamp
    var minutes = "0" + date.getMinutes();
    // Seconds part from the timestamp
    var seconds = "0" + date.getSeconds();
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  
    var formattedTime = date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear() + ' ' + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

    return formattedTime;
  }

  const [username, setUsername] = useState(UserService.getUsername);
  const [accessToken, setAccessToken] = useState(UserService.getToken());
  const [refreshToken, setRefreshToken] = useState(UserService.getRefreshToken());
  const [responseStatus, setResponseStatus] = useState(0);
  const [update, setUpdate] = useState(false);

  const callApi = () => {
    const headers = { 'Authorization': 'Bearer ' + accessToken }
    fetch('http://localhost:8081/v1/identities/3/contacts', { headers })
      .then(response => setResponseStatus(response?.status))
      //.then(data => console.log(data));
  }

  function parseJwt(token) {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  }
  
  const impersonate = async () => {
    console.log('impersonate');
    //await UserService.impersonate();
    await UserService.impersonate();
    setUpdate(!update);
    setUsername(UserService.getUsername());
  }

  const askToRefreshToken = () => {
    console.log(UserService.getRefreshToken());
    UserService.updateToken(() => {
      setAccessToken(UserService.getToken()); 
      setRefreshToken(UserService.getRefreshToken());
    });
    console.log(UserService.getRefreshToken());
  }

  return (
      <div className="App">
        <header className="App-header">
          { username ? 
            <div>
              <div>Login as :  {username} </div>
              <div>Token info:</div>
              <div style={{ fontSize: 25 }}>Exp : {getExp(accessToken)}</div>
              <div>Access token : </div>
              <div style={{ overflowWrap: 'anywhere', fontSize: 7 }}>{accessToken}</div>
              <div>Refresh token : </div>
              <div style={{ overflowWrap: 'anywhere', fontSize: 7 }}>{refreshToken}</div>
              <div style={{ fontSize: 25 }}>Exp : {getExp(refreshToken)}</div>
              <button className="btn btn-warning" style={{ marginRight: 10 }} onClick={() => UserService.doLogout()}>
              Logout
              </button>
              <button className="btn btn-success" style={{ marginRight: 10 }} onClick={() => window.open("http://localhost:8080/auth/realms/master/protocol/openid-connect/auth?client_id=iam-test&redirect_uri=https%3A%2F%2Fwww.keycloak.org%2Fapp%2F%23url%3Dhttp%3A%2F%2Flocalhost%3A8080%2Fauth%26realm%3Dmaster%26client%3Diam-test&response_type=code&scope=openid&kc_action=UPDATE_ACCOUNT", '_blank').focus()}>
                Update account
              </button>
              <button className="btn btn-info" style={{ marginRight: 10 }} onClick={() => impersonate()}>
              Impersonate
              </button>
              <button className='btn btn-danger' style={{ marginRight: 10 }} onClick={() => callApi()}>
              Call API
              </button>
              <button className='btn btn-dark' onClick={() => askToRefreshToken()}>
              Refresh token
              </button>
              <div>Response status from API: {responseStatus}</div>
            </div>
            : 
            <div>
                <button className="btn btn-success" style={{ marginRight: 10 }} onClick={() => UserService.doLogin()}>
                  Login
                </button> 

                <button className="btn btn-info" style={{ marginRight: 0 }} onClick={() => UserService.doRegister()}>
                Register
                </button>
            </div>
          }
        </header>
      </div>
  );
}

export default App;

// If any of the value in the array changes, the callback will be fired after every render.
// When it's not present, the callback will always be fired after every render.
// When it's an empty list, the callback will only be fired once, similar to componentDidMount.
//useEffect(() => console.log('mounted'), []);

// When you return a function in the callback passed to useEffect, the returned function will be called before the component is removed from the UI.
// need to pass an empty list as the second argument for useEffect so that the callback will only be called once
/*useEffect(() => {
    return () => {
      console.log('will unmount');
    }
  }, []);*/