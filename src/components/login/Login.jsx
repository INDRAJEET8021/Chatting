import React, { useState } from "react";
import "./login.css";
import { toast } from "react-toastify";
import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  getAuth,
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyB0UqWbAMvrUQ1mePIQZIkWxMHiY8lvz1E",
  authDomain: "chatapp-40385.firebaseapp.com",
  projectId: "chatapp-40385",
  storageBucket: "chatapp-40385.firebasestorage.app",
  messagingSenderId: "612912938667",
  appId: "1:612912938667:web:f2f6446b288cfcfe5681ee",
  databaseURL: "https://chatapp-40385-default-rtdb.firebaseio.com/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const Login = () => {
  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });

  const [load, setLoad] = useState(false); // State to track loading

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const uploadToCloudinary = async (file) => {
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/dtax0na6t/image/upload`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "fbChat");

    try {
      const response = await fetch(cloudinaryUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Cloudinary Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw error;
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoad(true);

    const formData = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formData);

    if (!username || !email || !password || !avatar.file) {
      toast.warn("Please fill out all fields and upload an image.");
      setLoad(false); // Reset loading state
      return;
    }

    try {
      const imageUrl = await uploadToCloudinary(avatar.file);

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: username, photoURL: imageUrl });

      const userDoc = doc(db, "users", user.uid);
      await setDoc(userDoc, {
        username: username,
        email: email,
        id: user.uid,
        avatar: imageUrl,
        blocked: [],
      });

      const userChats = doc(db, "userchats", user.uid);
      await setDoc(userChats, {
        chats: [],
      });

      toast.success("Account created successfully!");
    } catch (error) {
      console.error("Registration Error:", error);
      toast.error(error.message);
    } finally {
      setLoad(false); // Reset loading state
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoad(true);

    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);

    if (!email || !password) {
      toast.warn("Please enter your email and password.");
      setLoad(false); // Reset loading state
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      toast.success(`Welcome back, ${user.displayName || "User"}!`);
    } catch (error) {
      console.error("Login Error:", error.message);
      toast.error(getFirebaseErrorMessage(error.code));
    } finally {
      setLoad(false); // Reset loading state
    }
  };

  const getFirebaseErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/invalid-email":
        return "Invalid email address format.";
      case "auth/user-disabled":
        return "This user account has been disabled.";
      case "auth/user-not-found":
        return "No user found with this email address.";
      case "auth/wrong-password":
        return "Incorrect password entered.";
      default:
        return "An unknown error occurred. Please try again.";
    }
  };

  return (
    <div className="login">
      <div className="item">
        <h2>Welcome Back!</h2>
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" name="email" />
          <input type="password" placeholder="Password" name="password" />
          <button disabled={load}>{load ? "Loading..." : "Sign In"}</button>
        </form>
      </div>
      <div className="seperator"></div>

      <div className="item">
        <h2>Create an Account...</h2>
        <form onSubmit={handleRegister}>
          <label htmlFor="file">
            <img src={avatar.url || "./avatar.png"} alt="Upload Preview" />
            Upload Your Image
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
          <button disabled={load}>{load ? "Loading..." : "Sign Up"}</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
