import Keycloak from "keycloak-js";

const _kc = new Keycloak('/keycloak.json');

/**
 * Initializes Keycloak instance and calls the provided callback function if successfully authenticated.
 *
 * @param onAuthenticatedCallback
 */
const initKeycloak = (onAuthenticatedCallback) => {
  _kc.init({
    onLoad: 'check-sso',
    //silentCheckSsoRedirectUri: window.location.origin,
    pkceMethod: 'S256',
  })
  .then((authenticated) => {
    if (!authenticated) {
      console.log("user is not authenticated..!");
    }
    onAuthenticatedCallback();
  })
  .catch((e) => { console.log(e); });

};

const doLogin = _kc.login;

const doLogout = _kc.logout;

const doRegister = _kc.register;

const getToken = () => _kc.token;

const isLoggedIn = () => !!_kc.token;

const updateToken = (successCallback) =>
  _kc.updateToken(5)
    .then(successCallback)
    .catch(doLogin);

const getUsername = () => _kc.tokenParsed?.preferred_username;

const hasRole = (roles) => roles.some((role) => _kc.hasRealmRole(role));

const exchange = async (userId) => {

  var details = {
    'subject_token': _kc.token,
    'grant_type': 'urn:ietf:params:oauth:grant-type:token-exchange',
    'client_id': 'react-app',
    'requested_token_type': 'urn:ietf:params:oauth:token-type:refresh_token',
    //'audience': 'iam-reset',
    'requested_subject': 'ea2f9c6a-eed9-4fbd-807e-4646bbefa128'
  };
  const formBody = Object.keys(details).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(details[key])).join('&');
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: formBody
  };
  const res = await fetch('http://localhost:8080/auth/realms/master/protocol/openid-connect/token', requestOptions);
  let re = await res.json();
  console.log('Exchange access_token=', re.access_token);
  console.log('Exchange refresh_token=', re.refresh_token);
  console.log('Logout');
  await _kc.clearToken();
  console.log('Logout OK');
  
  const headers = { 
    //'Access-Control-Allow-Origin': '*',
    'Authorization': 'Bearer ' + re.access_token
  }
  fetch('http://localhost:8080/auth/realms/master/exchange/sso', { headers })
    .then(response => console.log(response));

  await _kc.init({
    promiseType: 'native',
    token: re.access_token,
    refreshToken: re.refresh_token,
    checkLoginIframe: false,
    promiseType: 'legacy'
    })
    .then((authenticated) => {
      if (!authenticated) {
        console.log("user is not authenticated..!");
      } else {
        console.log("user is authenticated : ", _kc.tokenParsed?.preferred_username);
      }
    })
    .catch((e) => {
      console.log(e);
    });
    console.log("user is authenticated : ", _kc.tokenParsed?.preferred_username);
}

const impersonate = async () => {
  const requestOptions = {
    headers: {
      //'Access-Control-Allow-Origin': '*',
      //'credentials': 'include',
      'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJJWWQwRXZUenctLTVIdGlYelFHZloydnBqZkFwZTVfd3pEM2cxbWJmSmM4In0.eyJleHAiOjE5OTk3NTkxNjQsImlhdCI6MTY1NDE1OTE2NSwianRpIjoiYzA4ZTE2Y2MtOWM2OS00NGJjLThmNmUtZTg0ZjgzMDkzY2VlIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgwL2F1dGgvcmVhbG1zL21hc3RlciIsImF1ZCI6WyJtYXN0ZXItcmVhbG0iLCJhY2NvdW50Il0sInN1YiI6IjNmMzAxN2IzLTk0YTEtNDJiMC05ODY4LTNhNTUzOTQyY2RjMCIsInR5cCI6IkJlYXJlciIsImF6cCI6IkZBQ0FERV9TT0FQIiwic2Vzc2lvbl9zdGF0ZSI6ImU4NGFlMWYwLTRiZjctNDIxZi05ZTY0LWE1NzhiMWY3YTcwOSIsImFjciI6IjEiLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiY3JlYXRlLXJlYWxtIiwib2ZmbGluZV9hY2Nlc3MiLCJhZG1pbiIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsibWFzdGVyLXJlYWxtIjp7InJvbGVzIjpbInZpZXctcmVhbG0iLCJ2aWV3LWlkZW50aXR5LXByb3ZpZGVycyIsIm1hbmFnZS1pZGVudGl0eS1wcm92aWRlcnMiLCJpbXBlcnNvbmF0aW9uIiwiY3JlYXRlLWNsaWVudCIsIm1hbmFnZS11c2VycyIsInF1ZXJ5LXJlYWxtcyIsInZpZXctYXV0aG9yaXphdGlvbiIsInF1ZXJ5LWNsaWVudHMiLCJxdWVyeS11c2VycyIsIm1hbmFnZS1ldmVudHMiLCJtYW5hZ2UtcmVhbG0iLCJ2aWV3LWV2ZW50cyIsInZpZXctdXNlcnMiLCJ2aWV3LWNsaWVudHMiLCJtYW5hZ2UtYXV0aG9yaXphdGlvbiIsIm1hbmFnZS1jbGllbnRzIiwicXVlcnktZ3JvdXBzIl19LCJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6InJlYWQ6aWRlbnRpdHk6cGVyc29uYWxEYXRhIG9wZW5faWQgcmVhZDppZGVudGl0eTpjb250YWN0Iiwic2lkIjoiZTg0YWUxZjAtNGJmNy00MjFmLTllNjQtYTU3OGIxZjdhNzA5In0.d3Y_hI5YeWIgy5VQMvGNQY-Rs40ZXDzkPLAl-aUPxc-OOfPnq1USrbU6Gr1Kei8JCVkjiB1E1y22UvoBC-JcPmV6b5Fwlh0O8aV04msGtgMi3JtF5j1pbTP7UxVhc7TDh5zgziMsGjD3u6TIYjSUZjQCS1fGmb1iFkBeakx1MKQ551gj5jxsCThEJHqOmBQ7OIZbRpLUWjqN0Q882RXTxgf4Rxr-NUn3gotefyNChXjY1V5P7S5YU_GBwglVQxhdoTAIrRZdRZvrd2ofWDRLO3GLo6ETtpNy-PtA8Qik1tOhn41GqGvcI9sqNRKGoaiJP7jzdH574oehkGD8WOc3eQ'
    },
  };
  const res = await fetch('http://localhost:8080/auth/realms/master/impersonation/impersonate/ea2f9c6a-eed9-4fbd-807e-4646bbefa128', requestOptions);
  let re = await res.json();
  console.log('Impersonate response : ', re);
}

const redirect = async () => {
  const requestOptions = {
    method: 'POST',
    headers: {
      //'Access-Control-Allow-Origin': '*',
      //'credentials': 'include',
      //'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJJWWQwRXZUenctLTVIdGlYelFHZloydnBqZkFwZTVfd3pEM2cxbWJmSmM4In0.eyJleHAiOjE5OTk2OTYzNzksImlhdCI6MTY1NDA5NjM3OSwianRpIjoiMWQ3OWJiNTEtMWUyOS00Nzc5LTlhNzQtYjUyMWVjYWQzM2M5IiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgwL2F1dGgvcmVhbG1zL21hc3RlciIsImF1ZCI6WyJtYXN0ZXItcmVhbG0iLCJhY2NvdW50Il0sInN1YiI6IjNmMzAxN2IzLTk0YTEtNDJiMC05ODY4LTNhNTUzOTQyY2RjMCIsInR5cCI6IkJlYXJlciIsImF6cCI6IkZBQ0FERV9TT0FQIiwic2Vzc2lvbl9zdGF0ZSI6IjhmYjMyY2MyLWFiM2ItNDc4Ny04NjU5LTcwNDZlM2RjNWYxMSIsImFjciI6IjEiLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiY3JlYXRlLXJlYWxtIiwib2ZmbGluZV9hY2Nlc3MiLCJhZG1pbiIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsibWFzdGVyLXJlYWxtIjp7InJvbGVzIjpbInZpZXctcmVhbG0iLCJ2aWV3LWlkZW50aXR5LXByb3ZpZGVycyIsIm1hbmFnZS1pZGVudGl0eS1wcm92aWRlcnMiLCJpbXBlcnNvbmF0aW9uIiwiY3JlYXRlLWNsaWVudCIsIm1hbmFnZS11c2VycyIsInF1ZXJ5LXJlYWxtcyIsInZpZXctYXV0aG9yaXphdGlvbiIsInF1ZXJ5LWNsaWVudHMiLCJxdWVyeS11c2VycyIsIm1hbmFnZS1ldmVudHMiLCJtYW5hZ2UtcmVhbG0iLCJ2aWV3LWV2ZW50cyIsInZpZXctdXNlcnMiLCJ2aWV3LWNsaWVudHMiLCJtYW5hZ2UtYXV0aG9yaXphdGlvbiIsIm1hbmFnZS1jbGllbnRzIiwicXVlcnktZ3JvdXBzIl19LCJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6InJlYWQ6aWRlbnRpdHk6cGVyc29uYWxEYXRhIG9wZW5faWQgcmVhZDppZGVudGl0eTpjb250YWN0Iiwic2lkIjoiOGZiMzJjYzItYWIzYi00Nzg3LTg2NTktNzA0NmUzZGM1ZjExIn0.TLf5fURu0aad0qNvjqw2t4-khMSFWbWC0dYRgTN_Bh0FVvuXI_A0hRibhlpmHtWSsFhuiE6RX5aWU2h_c1zQ4Jxw9fWTCcdD1aaZzvMCKuitArLiga3EgqO7tvSUb4F30boCeLzueU2cO0E8AJC4dzRksGxsi7tSjmdit4ISPDur8K1DvOndkjgw-mz3Kq2nmtTr_7UOYYTGpfcf1Mqkb8VnZVa8ENaMdCVGnz-VF32aLzV-L3oYq7fyEEwlLrrrwGpz6xnoXlwNAuXEJWNVnLX0ZaATj5x25x7PrQNBraz4_2ZFTR2Jt8MYKDBLpDykr3_zvPmbhrPO2Sis-gsGEQ'
    },
  };
  const res = await fetch('http://localhost:8080/auth/realms/master/impersonation/redirect', requestOptions);
  let re = await res.json();
  console.log('Impersonate response : ', re);
}

const UserService = {
  initKeycloak,
  doLogin,
  doLogout,
  doRegister,
  isLoggedIn,
  getToken,
  updateToken,
  getUsername,
  hasRole,
  exchange,
  impersonate,
  redirect
};

export default UserService;
