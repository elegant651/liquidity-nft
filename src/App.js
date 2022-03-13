import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import {
  Switch,
  HashRouter,
  Route,
  Redirect,
} from "react-router-dom";
import {
  Button
} from "react-bootstrap";
import useWeb3Modal from "./hooks/useWeb3Modal";
import history from './components/history';
import Header from './components/Header';
import UploadAllOne from './components/UploadAllOne';
import CreateToken from './components/CreateToken';
import Main from './components/Main';
import Profile from './components/Profile';
import View from './components/View';
import Upload from './components/Upload';
import Mint from './components/Mint';

const WalletButton = ({ provider, loadWeb3Modal, logoutOfWeb3Modal }) => {
  return (
    <Button style={{fontSize: "11px", lineHeight: "20px", color: "#212736", background: "#F3F3F3", borderRadius: "199px"}}
      onClick={async () => {
        if (!provider) {
          loadWeb3Modal();
        } else {
          logoutOfWeb3Modal();
        }
      }}
    >
      {!provider ? "Connect Wallet" : "Disconnect Wallet"}
    </Button>
  );
}

function App() {
  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();

  const routes = (
    <Switch>
      <Route path="/" exact>
        <Main />
      </Route>
      <Route path="/all-in-one" exact>
        <UploadAllOne />
      </Route>
      <Route path="/create-token" exact>
        <CreateToken />
      </Route>
      <Route path="/upload" exact>
        <Upload />
      </Route>
      <Route path="/mint" exact>
        <Mint />
      </Route>
      <Route path="/profile" exact>
        <Profile />
      </Route>
      <Route path="/view/:profileAddr" exact>
        <View />
      </Route>
      <Redirect to="/" />
    </Switch>
  );

  return (
    <div className="App">      
      <HashRouter history={history}>
        <Header />
        <WalletButton provider={provider} loadWeb3Modal={loadWeb3Modal} logoutOfWeb3Modal={logoutOfWeb3Modal} />
        {routes}
      </HashRouter>
    </div>
  );
}

export default App;
