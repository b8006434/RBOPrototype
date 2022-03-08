import React from 'react';
import ReactDOM from 'react-dom';
import { Switch, Route, BrowserRouter } from 'react-router-dom';

import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import AdminDashboard from './AdminDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import Chat from './Chat/Chat'
import UserManagement from './UserManagement'
import './Login.css';

//The 'Controller' class which has routes to the components
//When adding a component, it needs to be imported and added to the routes below
ReactDOM.render(
    <BrowserRouter>
        <Switch>
            <Route exact path='/' component={Login} />
            <Route exact path='/register' component={Register} />
            <Route exact path='/dashboard' component={Dashboard} />
            <Route path='/admindashboard' component={AdminDashboard} />
            <Route path='/employeedashboard' component={EmployeeDashboard} />
            <Route path='/usermanagement' component={UserManagement} />
            *<Route exact path="/chat/:requestID" component={Chat} />
            {/* <Route component={NotFound}/> */}
        </Switch>
    </BrowserRouter>,
    document.getElementById('root')
);