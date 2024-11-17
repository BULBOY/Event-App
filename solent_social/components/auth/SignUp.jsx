import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCreateUserWithEmailAndPassword, useUpdateProfile } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase_conf";
import { doc, setDoc } from "firebase/firestore"; 


const SignUp = () => {

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [createUserWithEmailAndPassword, user, loading, error] = useCreateUserWithEmailAndPassword(auth);
    const [updateProfile, updating, updateError] = useUpdateProfile(auth);
    

    const handleSignUp = async (e) => {
        e.preventDefault(); // Prevent form reload
        try {
            const result = await createUserWithEmailAndPassword(email, password); // Use hook for signup
            const user = result.user;

            if (result) {
                // Update the user's profile with their name
                await updateProfile({ displayName: name });
                console.log("User created successfully:", result.user);

                await setDoc(doc(db, "users", user.uid), {
                    name: name,
                    email: email,
                    createdAt: new Date(),
                    is_admin: false,
                  });    

            setName('');
            setEmail('');
            setPassword('');
            }
        } catch (error) {
            console.error("Error creating user:", error.message);
        }
    };

    return (
        <div>
            <Link to="/">Go to Home</Link>
            <div className="container mt-3 d-flex justify-content-center">
                <form
                    className="col-md-6 col-lg-4 col-sm-8 p-3 border rounded shadow-sm"
                    onSubmit={handleSignUp}
                >
                    <header>
                        <h2>Sign Up</h2>
                    </header>

                    <div className="mb-3">
                        <label htmlFor="exampleInputName" className="form-label">Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="exampleInputName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

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
                        {loading ? "Signing Up..." : "Submit"}
                    </button>
                    {error && <div className="text-danger mt-2">{error.message}</div>}
                    <div id="emailHelp" className="form-text">
                        Already have an account? <Link to="/signin">Sign In</Link>
                    </div>
                </form>
            </div>
        </div>
    );
 };

 export default SignUp;
