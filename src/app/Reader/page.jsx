"use client";

import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/firebase/firebaseconfig"; // Ensure you import Firestore as well
import { useRouter } from "next/navigation";
import ReaderNavbar from "@/Components/ReaderNavbar/page";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore"; // Import Firestore methods
import { formatDistanceStrict } from "date-fns";
import bookmark from "@/../../assets/bookmark.png";
import bookmark1 from "@/../../assets/save-instagram.png";

import Image from "next/image";
// import Swal from "sweetalert2";

export default function Reader() {
  const route = useRouter();
  const [nameOfUser, setnameOfUser] = useState();
  const [user, setUser] = useState();
  const [blog, setBlog] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // User is not logged in, redirect to login page
        route.push("/Login");
      } else {
        setUser(user.uid);
        // User is logged in, check the user's role
        const userDoc = doc(db, "user", user.uid); // Reference to the user's document in Firestore
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          // console.log(userData);
          setnameOfUser(userData.username);
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
    setLoading(true);
    const fetchAllBlogs = async () => {
      if (!user) return;
      const blogRef = collection(db, "blogs");
      const blogQuery = query(
        blogRef,
        where("Hold", "==", false),
        where("Delete", "==", false)
      );
      // console.log("🚀 ~ fetchAllBlogs ~ blogRef:", blogRef)

      try {
        const allBlogsSnapshot = await getDocs(blogQuery);
        // console.log("🚀 ~ fetchAllBlogs ~ allBlogsSnapshot:", allBlogsSnapshot)
        const allBlogs = allBlogsSnapshot.docs.map((doc) => {
          let obj = doc.data();
          let blogObj = {
            ...obj,
            blogid: doc.id,
            delDoc: doc.ref,
          };
          return blogObj;
        });
        // console.log(allBlogs);

        setBlog(allBlogs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    // console.log(blog);

    fetchAllBlogs();
  }, [user]);
  // console.log(blog);
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-infinity loading-lg"></span>
      </div>
    );
  }

  return (
    <>
      <ReaderNavbar username={nameOfUser} />
      {blog &&
        blog.map((data) => (
          <div className="card bg-base-300 w-80 ml-10 min-h-44 mt-5 inline-block shadow-xl">
            <label className="swap absolute top-1 right-2">
              <input type="checkbox" />
              <div className="swap-on">
                <Image src={bookmark} width={"30"} />
              </div>
              <div className="swap-off">
                <Image src={bookmark1} width={"30"} />
              </div>
            </label>
            <div className="card-body">
              <h2 className="card-title">
                {" "}
                AuthorName :{" "}
                {data.authorName.length > 8
                  ? data.authorName.slice(0, 8) + "..."
                  : data.authorName}
              </h2>
              <h2 className="card-title">
                Title :{" "}
                {data.title.length > 10
                  ? data.title.slice(0, 10) + "..."
                  : data.title}
              </h2>
              <p className="break-words">
                Blog :{" "}
                {data.blog.length > 40
                  ? data.blog.slice(0, 40) + "..."
                  : data.blog}
              </p>
              <div className="card-actions justify-end">
                <button
                  onClick={() => route.push(`/Reader/${data.blogid}`)}
                  className="btn btn-primary"
                >
                  See More
                </button>
              </div>
              <p>
                {" "}
                {data.addedAt &&
                  formatDistanceStrict(data.addedAt.toDate(), new Date(), {
                    addSuffix: true,
                  })}
              </p>
              <p>{data.uploder ? `${data.uploder} upload this blog.` : null}</p>
            </div>
          </div>
        ))}
    </>
  );
}
