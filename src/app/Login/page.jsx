"use client";
// import React from 'react'
import Link from "next/link";
import Navbar from "../../Components/Navbar/page";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { auth, db } from "@/firebase/firebaseconfig"; // Ensure 'db' is imported for Firestore
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore"; // Import Firestore methods

export default function Login() {
  const route = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const HandleLogin = () => {
    setLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;

        // Fetch the user's role from Firestore
        const userDoc = doc(db, "user", user.uid); // Reference to the user's document in Firestore
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          const userRole = userData.role; // Assuming 'role' is stored in Firestore

          // Redirect based on the role
          if (userRole === "Writer") {
            route.push("/Writer");
          } else if (userRole === "Reader") {
            route.push("/Reader");
          } else if (userRole === "Admin") {
            route.push("./Admin");
          } else {
            // Handle unknown roles or errors
            Swal.fire({
              title: "Error!",
              text: "Unknown role.",
              icon: "error",
              confirmButtonText: "OK",
            });
          }
        } else {
          Swal.fire({
            title: "Error!",
            text: "User data not found.",
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      })
      .catch((error) => {
        Swal.fire({
          title: "Error!",
          text: error.message,
          icon: "error",
          confirmButtonText: "OK",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col justify-center items-center mt-20 gap-4">
        <h1 className="text-[40px] underline">Login</h1>
        <label className="input input-bordered flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-4 w-4 opacity-70"
          >
            <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
            <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
          </svg>
          <input
            type="text"
            className="grow"
            placeholder="Email"
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
        </label>

        <label className="input input-bordered flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-4 w-4 opacity-70"
          >
            <path
              fillRule="evenodd"
              d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="password"
            className="grow"
            placeholder="Password"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
        </label>

        <button
          className={`btn btn-active btn-primary ${
            loading ? "btn-disabled" : ""
          }`}
          onClick={HandleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <p>
          Does have not an account?{" "}
          <Link className="underline" href={"/Signup"}>
            Signup here
          </Link>
          .
        </p>
      </div>
    </>
  );
}
