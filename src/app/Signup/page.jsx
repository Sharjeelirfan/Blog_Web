"use client";

import Link from "next/link";
import Navbar from "../../Components/Navbar/page";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/firebase/firebaseconfig";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
// import Image from "next/image";
// import hideImg from "../../../assets/hide.png";
// import showImg from "../../../assets/view.png"; // Add a show password icon

export default function Signup() {
  const route = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = () => {
    if (!role) {
      setError("Please select a role before signing up.");
      Swal.fire({
        title: "Error!",
        text: "Please select a role before signing up.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return; // Prevent further execution if no role is selected
    }
    if(!username){
      setError("Please Enter a username before signing up.");
      Swal.fire({
        title: "Error!",
        text: "Please Enter a username before signing up.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return; 
    }
    setLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const userData = userCredential.user;
        saveUserInFirestore(email, userData.uid, role, username);
      })
      .catch((error) => {
        setError(error.message);
        console.error("Error during signup:", error);
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

  const saveUserInFirestore = async (email, uid, role, username) => {
    let user = { email, uid, role, username };
    let docRef = doc(db, "user", uid);
    await setDoc(docRef, user);
    if (role === "Writer") {
      route.push("/Writer");
    } else if (role === "Reader") {
      route.push("/Reader");
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col justify-center items-center mt-20 gap-4">
        <h1 className="text-[40px] underline">Signup</h1>
        <label className="input input-bordered flex items-center gap-2">
          <input
            type="text"
            className="grow"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="input input-bordered flex items-center gap-2">
          <input
            type="text"
            className="grow"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <label className="input input-bordered flex items-center gap-2">
          <input
            type="password"
            className="grow"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <div className="dropdown flex justify-center w-96">
          <div
            tabIndex={0}
            role="button"
            className="btn bg-primary w-2/4 text-black hover:text-white m-1"
          >
            {role ? role : "Select Role"}{" "}
            {/* Display selected role or default text */}
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-primary text-black rounded-box z-[1] w-52 p-2 shadow"
          >
            <li>
              <a onClick={() => setRole("Reader")}>Reader</a>
            </li>
            <li>
              <a onClick={() => setRole("Writer")}>Writer</a>
            </li>
          </ul>
        </div>
        <button
          className={`btn btn-active btn-primary ${
            loading ? "btn-disabled" : ""
          }`}
          onClick={handleSignup}
          disabled={loading}
        >
          {loading ? "Signing up..." : "Signup"}
        </button>

        {error && <p className="text-red-500">{error}</p>}
        <p>
          Already have an account?{" "}
          <Link className="underline" href={"/Login"}>
            Login here
          </Link>
          .
        </p>
      </div>
    </>
  );
}
