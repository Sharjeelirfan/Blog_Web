"use client";
import React from "react";
import WriterNavbar from "@/Components/WriterNavbar/page";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/firebase/firebaseconfig";
import { formatDistanceStrict } from "date-fns";
import Swal from "sweetalert2";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
} from "firebase/firestore";

export default function UnPublished() {
  const route = useRouter();
  const [nameOfUser, setnameOfUser] = useState();
  const [blogs, setBlogs] = useState();
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // User is not logged in, redirect to login page
        route.push("/Login");
      } else {
        setUser(user.uid);

        const userDoc = doc(db, "user", user.uid);
        const userSnapshot = await getDoc(userDoc);
        // console.log(user.uid);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          const userRole = userData.role;
          setnameOfUser(userData.username);

          // Redirect based on role
          if (userRole === "Reader") {
            route.push("/Reader");
          }
          // If the user is a Writer, they can stay on this page
        } else {
          console.error("User data not found in Firestore.");
          route.push("/Login");
        }
      }
    });
  }, [route]);

  //   console.log(user);

  useEffect(() => {
    setLoading(true);
    const fetchAllBlogs = async () => {
      if (!user) return;
      const blogRef = collection(db, "blogs");
      const blogQuery = query(
        blogRef,
        where("uid", "==", user),
        where("Hold", "==", true),
        where("Delete", "==", false)
      );

      //   console.log("🚀 ~ fetchAllBlogs ~ blogRef:", blogQuery)

      try {
        const allBlogsSnapshot = await getDocs(blogQuery);
        // console.log("🚀 ~ fetchAllBlogs ~ allBlogsSnapshot:", allBlogsSnapshot)
        const allBlogs = allBlogsSnapshot.docs.map((doc) => {
          let obj = doc.data();
          let blogObj = {
            ...obj,
            blogid: doc.id,
            blogPub: doc.ref,
          };
          return blogObj;
        });
        // console.log(blogPub);

        setBlogs(allBlogs);
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

  const Publish = async (blogPub) => {
    if (!blogPub || !blogPub.id) {
      console.error("Invalid blogPub object:", blogPub);
      return; // Exit the function if blogPub is not valid
    }

    try {
      const blogRef = doc(db, "blogs", blogPub.id);
      await updateDoc(blogRef, { Hold: false });

      // Optimistically update the UI by removing the blog
      setBlogs((prevBlogs) =>
        prevBlogs.filter((blog) => blog.blogid !== blogPub.id)
      );
    } catch (e) {
      console.error("Error updating document:", e);
      Swal.fire({
        title: "Error",
        text: e.message, // Use e.message for a cleaner error message
        icon: "error",
      });
    }
  };

  return (
    // <div>unPublished</div>

    <>
      <WriterNavbar username={nameOfUser} />
      {blogs &&
        blogs.map((data) => (
          <div
            key={data.blogid}
            className="card bg-base-300 w-80 ml-10 min-h-64 mt-5 inline-block shadow-xl"
          >
            <div className="dropdown dropdown-end absolute top-2 right-2">
              <label tabIndex={0} className="btn btn-ghost btn-circle">
                &#8942;
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40"
              >
                {/* <li
                  className="cursor-pointer p-3"
                  onClick={() => deleteBlog(data.blogDel)}
                >
                  Delete
                </li> */}
                <li
                  className="cursor-pointer hover:bg-slate-100 active:bg-blue-500 p-3"
                  onClick={() => {
                    Publish(data.blogPub);
                  }}
                >
                  {"Publish"}
                </li>
              </ul>
            </div>
            <div className="card-body">
              <h2 className="card-title">
                {" "}
                Author Name :{" "}
                {data.authorName && data.authorName.length > 6
                  ? data.authorName.slice(0, 6) + "..."
                  : data.authorName}
              </h2>{" "}
              <h2 className="card-title ">
                Title :{" "}
                {data.title && data.title.length > 10
                  ? data.title.slice(0, 10) + "..."
                  : data.title}
              </h2>
              <p className="break-words">
                Blog :{" "}
                {data.blog && data.blog.length > 50
                  ? data.blog.slice(0, 50) + "..."
                  : data.blog}
              </p>
              {/* <p> ok{data.blogid}</p> */}
              <div className="card-actions mt-auto justify-end  ">
                <button
                  className="btn btn-primary mt-10"
                  onClick={() => route.push(`/Writer/${data.blogid}`)}
                >
                  Read More
                </button>
              </div>
              <p>
                {" "}
                {data.addedAt &&
                  formatDistanceStrict(data.addedAt.toDate(), new Date(), {
                    addSuffix: true,
                  })}
              </p>
            </div>
          </div>
        ))}
    </>
  );
}
