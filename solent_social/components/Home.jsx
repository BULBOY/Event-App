import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase_conf";
import MapComponent from "./MapComponent";
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import AdminPg from "./adminPage";

const Home = () => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAdminStatus = async (userId) => {
            try {
                const userDocRef = doc(db, "users", userId);
                const userDoc = await getDoc(userDocRef);
                
                if (userDoc.exists()) {
                    const adminStatus = userDoc.data().is_admin === true;
                    setIsAdmin(adminStatus);
                }
            } catch (error) {
                console.error("Error checking admin status:", error);
            }
        };

        const userData = sessionStorage.getItem('user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            
            if (parsedUser?.uid) {
                checkAdminStatus(parsedUser.uid);
            }
        }

        const handleLogin = (event) => {
            const loggedInUser = event.detail.user;
            setUser(loggedInUser);
            
            if (loggedInUser?.uid) {
                checkAdminStatus(loggedInUser.uid);
            }
        };

        window.addEventListener('userLogin', handleLogin);
        return () => window.removeEventListener('userLogin', handleLogin);
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem('user');
        setUser(null);
        setIsAdmin(false);
        navigate('/');
    };

    const AuthNav = () => (
        user ? (
            <div className="d-flex align-items-center">
                <span className="text-white me-3">
                    Welcome, {user.displayName || user.email}
                </span>
                {/* {isAdmin && (
                    <Link to='/admin' className="btn btn-warning me-2">
                        Admin Panel
                    </Link>
                )} */}
                <button 
                    className="btn btn-light"
                    onClick={handleLogout}
                >
                    Log Out
                </button>
            </div>
        ) : (
            <div className="d-flex gap-2">
                <Link to='/signin'>
                    <button className="btn btn-light">
                        Sign In
                    </button>
                </Link>
                <Link to='/signup'>
                    <button className="btn btn-light">
                        Sign Up
                    </button>
                </Link>
            </div>
        )
    );

    return (
        <div className="min-vh-100 d-flex flex-column">
            <div className="mb-3">
                <header>
                    <div className="bg-danger py-4">
                        <h1 className="text-center text-dark mb-0 fw-bold">
                            WELCOME TO <span className="text-white">SOLENT</span> MEETUPS AND SOCIAL EVENTS
                        </h1>
                    </div>
                    <nav className="bg-dark py-3 px-4">
                        <div className="container-fluid d-flex justify-content-end">
                            <AuthNav />
                        </div>
                    </nav>
                </header>
            </div>

            <div className="container mb-4" >
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="input-group">
                            <span className="input-group-text bg-white">
                                Event type
                            </span>
                            <input 
                                type="text" 
                                className="form-control"
                                id="events"
                                aria-label="Event type"
                            />
                            <button 
                                className="btn btn-danger"
                                onClick={() => {}}
                            >
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="container flex-grow-1">
                <div className="row h-100">
                    <div className="col">
                        <div style={{ height: '75vh' }}>
                            {!isAdmin && (
                                <MapComponent />
                            )}
                            <br />
                            {isAdmin && (
                            <><h1 style={{textAlign:'center', color:'red'}}>Admin Panel</h1>
                                <div>
                                    <AdminPg />
                                </div>
                                </>
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;