"use client";
import { useState, useEffect } from "react";
import WriterNavbar from "@/Components/WriterNavbar/page";
// import React, { useState } from 'react'
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/firebase/firebaseconfig";
import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function CreateNewBlog() {
  const route = useRouter();
  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // User is not logged in, redirect to login page
        route.push("/Login");
      } else {
        // User is logged in, check the user's role
        const userDoc = doc(db, "user", user.uid); // Reference to the user's document in Firestore
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          const userRole = userData.role; // Assuming 'role' is stored in Firestore
          setnameOfUser(userData.username);
          // Redirect based on role
          if (userRole === "Reader") {
            route.push("/Reader");
          }

          // If the user is a Writer, they can stay on this page
        } else {
          // Handle case where user data does not exist in Firestore
          console.error("User data not found in Firestore.");
          route.push("/Login");
        }
      }
    });

    // Cleanup subscription on component unmount
  }, [route]);

  const [nameOfUser, setnameOfUser] = useState();
  const [authorName, setAuthorName] = useState();
  const [blog, setBlog] = useState();
  const [alert , setAlert] = useState(false)
  const [title, setTitle] = useState();
  const [loading , setLoading] = useState(false)

  const addNewBlog = async () => {
    setLoading(true);
    const newBlog = {
      authorName: authorName,
      title: title,
      blog: blog,
      uid: auth.currentUser.uid,
      addedAt : serverTimestamp(),
      uploder : nameOfUser,
      Hold : false,
      Delete : false
    };
    // console.log(newBlog);

    if (authorName && title && blog.trim() != "") {
      try {
        let newBlogRef = collection(db, "blogs");
        await addDoc(newBlogRef, newBlog);
        // console.log("added" + newBlog);

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
        setAuthorName("");
        setTitle("");
        setBlog("");
        setAlert(true)
        setTimeout(() => {
          setAlert(false)
        }, 3000);
        
      }
    }
    else{
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please fill all the inputs!",
        
      });
      setLoading(false)
    }
  }
   

  return (
    <>
      <WriterNavbar username={nameOfUser} />

      {alert && (
        <div role="alert" className="alert alert-success absolute">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Your new blog has been successfully added</span>
        </div>
      )}

      <div className="mt-20 mx-auto w-1/3 text-center ">
        <h1 className="font-bold ml-6 text-3xl my-5">ADD NEW BLOG</h1>
        <input
          type="text"
          placeholder="Author Name"
          className="input input-bordered min-w-10 w-full max-w-xs mt-3 ml-5"
          value={authorName}
          required
          onChange={(e) => {
            setAuthorName(e.target.value);
          }}
        />
        <br />
        <input
          type="text"
          placeholder="Title"
          className="input input-bordered w-full max-w-xs mt-3 ml-5"
          value={title}
          required
          onChange={(e) => {
            setTitle(e.target.value);
          }}
        />
        <br />
        <textarea
          className="textarea textarea-bordered ml-5 mt-5 min-w-96"
          placeholder="Content"
          value={blog}
          required
          onChange={(e) => {
            setBlog(e.target.value);
          }}
        ></textarea>

        <br />
        <button
          className="btn btn-active ml-5 mt-5 w-28 text-black hover:text-white bg-blue-500"
          onClick={addNewBlog}
        >
          {loading ? "Add..." : "Add"}
        </button>
      </div>
    </>
  );
}
