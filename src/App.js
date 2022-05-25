import './App.css';
import Homepage from './pages/home-page';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Workspace from './pages/workspace-page';
import Compare from './pages/compare-repository-page';
import Copilot from './pages/github-copilot-page';
import Security from './pages/security-page';
import Information from './pages/information-page';
import Moss from './pages/moss-page';
import CompareMultiple from './pages/compare-multiple-repository-page';

function App() {
  return (
    <Router>
      <Switch>
          <Route exact path="/" component={Homepage}/>
          <Route path="/workspace" component={Workspace}/>
          <Route path="/workspace" component={Workspace}/>
          <Route path="/compare" component={Compare}/>
          <Route path="/copilot" component={Copilot}/>
          <Route path="/security" component={Security}/>
          <Route path="/moss" component={Moss}/>
          <Route path="/compare-multiple" component={CompareMultiple}/>
          <Route path="/information" component={Information}/>
      </Switch>
    </Router>
  );
}

export default App;
