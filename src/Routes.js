import React from 'react';
import { Route, Switch } from 'react-router-dom';
import TablePage from './pages/tablepage';
import Login from './pages/login';
import Register from './pages/register';

const Routes = () => {
  return (
    <Switch>
      {/* <Route exact path="/tables" component={TablePage} />
      <Route exact path="/login" component={Login} />
      <Route exact path="/register" component={Register} /> */}
    </Switch>
  );
};

export default Routes;