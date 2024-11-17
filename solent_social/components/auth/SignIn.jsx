import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { app, auth, db } from "../firebase_conf";
import { doc, getDoc } from "firebase/firestore"; 

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const saveToSessionStorage = (userData) => {
        // Store user data in session storage
        sessionStorage.setItem('user', JSON.stringify({
          uid: userData.uid,
          email: userData.email,
          displayName: userData.displayName,
          isLoggedIn: true,
          loginTime: new Date().toISOString()
        }));
      };
// class SignIn extends Component {
//     // constructor(props) {
//     //     super(props);
//     //     this.state = {
//     //         email: '',
//     //         password: ''
//     //     };
//     // }

//     // changeHandler = (event) => {
//     //     this.setState({ [event.target.name]: event.target.value });
//     // };

//     // signinhandler = async () => {
//     //     const {email, password} = this.state;
//     //     try {
//     //         await auth.signInWithEmailAndPassword(email, password);
//     //         alert('Signed in successfully!');
//     //     }catch(error) {
//     //         alert(error.message)
//     //     }
//     // }

//     satate = {
//         email: '',
//         password: ''
//     }

const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Get additional user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      let userData = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || '',
        ...userDoc.exists() ? userDoc.data() : {}
      };

      // Save user data to session storage
      saveToSessionStorage(userData);

      // Dispatch a custom event to notify other components about the login
      window.dispatchEvent(new CustomEvent('userLogin', { 
        detail: { user: userData }
      }));

      setEmail('');
      setPassword('');
      navigate('/');
    } catch (error) {
      let errorMessage = 'Failed to sign in';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        default:
          errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    };
};
    return (
        <div>
            <Link to="/">Go to Home</Link>
            <div className="container mt-3 d-flex justify-content-center">
                <form
                    className="col-md-6 col-lg-4 col-sm-8 p-3 border rounded shadow-sm"
                    onSubmit={handleSignIn}
                >
                    <header>
                        <h2>Sign In</h2>
                    </header>

                    <div className="mb-3">
                        <label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
                        <input
                            type="email"
                            className="form-control"
                            id="exampleInputEmail1"
                            aria-describedby="emailHelp"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="exampleInputPassword1"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={loading} // Disable button while loading
                    >
                        {loading ? "Signing In..." : "Submit"}
                    </button>
                    {error && <div className="text-danger mt-2">{error.message}</div>}
                    <div id="emailHelp" className="form-text">
                        Already have an account? <Link to="/signup">Sign Up</Link>
                    </div>
                </form>
            </div>
        </div>
    );
   };

export default SignIn;