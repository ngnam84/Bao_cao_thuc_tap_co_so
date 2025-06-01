import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const PrivateRoute = ({ children, ...otherProps }) => {

    const checkAuth = () => {
        if (localStorage.getItem('client') !== null){
            return true;
        }else{
            return false;
        }
    }

    return (
        <Route {...otherProps}
        render={ ({location}) => checkAuth() 
        ? (children) 
        : <Redirect to={{
            pathname: "/login",
            state: {from: location}
        }}
        />
        }
        />
    );  
}

export default PrivateRoute;