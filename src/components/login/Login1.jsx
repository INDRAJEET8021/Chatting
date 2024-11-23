import React, { useState } from "react";
import "./login.css";
import { toast } from "react-toastify";
const Login = () => {
  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formData);
    console.log(username);

    // toast.warn("Enter Details");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    toast.warn("Enter Details");
  };

  return (
    <div className="login">
      <div className="item">
        <h2>Welcome Back!</h2>
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" name="email" />
          <input type="password" placeholder="Password" name="password" />
          <button>Sign In</button>
        </form>
      </div>
      <div className="seperator"></div>

      {/* Registering */}
      <div className="item">
        <h2>Create an Account...</h2>
        <form onSubmit={handleRegister}>
          <label htmlFor="file">
            <img src={avatar.url || "./avatar.png"} />
            Upload Image
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleAvatar}
          />
          <input type="text" placeholder="UserName" name="username" />
          <input type="email" placeholder="Email" name="email" />
          <input type="password" placeholder="Password" name="password" />
          <button>Sign Up</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
