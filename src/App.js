import React, { useState, useEffect } from 'react';
import './App.css';
import UserService from './services/UserService';

function App() {

  console.log('init APP');

  const [username, setUsername] = useState(UserService.getUsername);
  const [update, setUpdate] = useState(false);

  const impersonate = async () => {
    console.log('impersonate');
    //await UserService.impersonate();
    await UserService.impersonate();
    setUpdate(!update);
    setUsername(UserService.getUsername());
  }

  return (
      <div className="App">
        <header className="App-header">
          { username ? 
            <div>
              <div>Login as :  {username} </div> <br/>
              <button className="btn btn-success" style={{ marginRight: 10 }} onClick={() => UserService.doLogout()}>
              Logout
              </button>
              <button className="btn btn-info" style={{ marginRight: 0 }} onClick={() => impersonate()}>
              Impersonate
              </button>
            </div>
            : 
            <div>
                <button className="btn btn-success" style={{ marginRight: 0 }} onClick={() => UserService.doLogin()}>
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