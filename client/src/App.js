import React from 'react'
import {BrowserRouter} from "react-router-dom"
import 'materialize-css'
import {useRoutes} from "./routes";
import {useAuth} from "./hooks/auth";
import {AuthContext} from "./context/AuthContext";
import {Navbar} from "./components/Navbar";
import {Loader} from "./components/Loader";

function App() {
    const {token, login, logout, userId, ready} = useAuth()
    const isAutheticated = !!token
    const routes = useRoutes(isAutheticated)

    if (!ready) {
        return <Loader />
    }

    return (
        <AuthContext.Provider value={{
            token, login, logout, userId, isAutheticated
        }}>
            <BrowserRouter>
                { isAutheticated && <Navbar /> }
                <div className="container">
                    {routes}
                </div>
            </BrowserRouter>
        </AuthContext.Provider>
    );
}

export default App;
