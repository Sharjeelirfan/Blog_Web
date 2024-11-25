"use client";
import { useParams } from 'next/navigation'
import {React , useEffect, useState}  from 'react'
import { useRouter } from 'next/navigation'
import { doc, getDoc } from "firebase/firestore";
import { db, auth   } from "@/firebase/firebaseconfig";
import { onAuthStateChanged } from 'firebase/auth'
import ReaderNavbar from '@/Components/ReaderNavbar/page';

export default function blogDetail() {
    const {blogid} = useParams()
    const [loading , setLoading] = useState()
    const [blog , setBlog] = useState()
    // const [user , setUser] = useState()
    const [nameOfUser ,setNameOfUser] = useState()
    let route = useRouter()


    
  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // User is not logged in, redirect to login page
        route.push("/Login");
      } else {
        // setUser(user.uid);
        // User is logged in, check the user's role
        const userDoc = doc(db, "user", user.uid); // Reference to the user's document in Firestore
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          // console.log(userData);
          setNameOfUser(userData.username);
          const userRole = userData.role; // Assuming 'role' is stored in Firestore

          // Redirect based on role
          if (userRole === "Writer") {
            route.push("/Writer");
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
    // return () => unsubscribe();
  }, [route]);

  useEffect(() => {
    setLoading(true)
    const fetchBlog = async () => {
      if (blogid) {
        const blogRef = doc(db, "blogs", blogid);
        try {
          const blogSnapshot = await getDoc(blogRef);
          if (blogSnapshot.exists()) {
            setBlog(blogSnapshot.data());
            
        }
    } catch (error) {
        console.error("Error fetching blog:", error);
    } finally {
        setLoading(false);
    }
} else {
    console.log("No ID found in parameters");
    setLoading(false);
}
};
fetchBlog();
}, [blogid]);

// console.log(blog);
  if (loading) {
   return (
     <div className="flex items-center justify-center min-h-screen">
       <span className="loading loading-infinity loading-lg"></span>
     </div>
   )}
     if (!blog) return <h1>No blog found.</h1>; 


  return (
    <>
      <ReaderNavbar username={nameOfUser} />
      <div>
        <h2 className="card-title">
          {" "}
          <span className="underline">Author Name </span> : {blog.authorName}
        </h2>{" "}
        <h2 className="card-title">
          <span className="underline">Title </span>: {blog.title}
        </h2>{" "}
        <p>
          <span className="font-bold underline">Blog</span> : {blog.blog}
        </p>
      </div>
    </>
  );
}
