import React, { Component } from "react";
import { Link } from "react-router-dom";

class SignUp extends Component {
    satate = {
        name: '',
        email: '',
        password: ''
    }
    render() {
        return ( <>

            <div><Link to='/'>Go to Home</Link></div>
            <div className="container mt-3 d-flex justify-content-center">
                
                <form className="col-md-6 col-lg-4 col-sm-8 p-3 border rounded shadow-sm">
                    <header>
                        <h2>Sign Up</h2>
                    </header>

                    <div className="mb-3">
                        <label htmlFor="exampleInputName" className="form-label">Name</label>
                        <input type="name" className="form-control" id="exampleInputName" />
                        
                    </div>

                    <div className="mb-3">
                        <label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
                        <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp"/>
                        
                    </div>
        
                    <div className="mb-3">
                        <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                        <input type="password" className="form-control" id="exampleInputPassword1"/>
                    </div>

                    <button type="submit" className="btn btn-primary w-100">Submit</button>
                    <div id="emailHelp" className="form-text">Already have an account? <Link to='/signin'>Sign In</Link></div>
                </form>
                
            </div>

        </>);
    }
}

export default SignUp;