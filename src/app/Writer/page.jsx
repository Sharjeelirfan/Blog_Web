"use client";

import React, { use, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/firebase/firebaseconfig";
import { useRouter } from "next/navigation";
import WriterNavbar from "@/Components/WriterNavbar/page";
import { formatDistanceStrict } from "date-fns";
import Swal from "sweetalert2";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

export default function Writer() {
  const route = useRouter();
  const [nameOfUser, setnameOfUser] = useState();
  const [blogs, setBlogs] = useState();
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(false);
  // const [hold , setHold] = useState(false)
  const hold = false;

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
          const userRole = userData.role; // Assuming 'role' is stored in Firestore
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

  useEffect(() => {
    setLoading(true);
    const fetchAllBlogs = async () => {
      if (!user) return;
      const blogRef = collection(db, "blogs");
      const blogQuery = query(
        blogRef,
        where("uid", "==", user),
        where("Hold", "==", false),
        where("Delete", "==", false)
      );

      try {
        const allBlogsSnapshot = await getDocs(blogQuery);
        const allBlogs = allBlogsSnapshot.docs.map((doc) => {
          let obj = doc.data();
          let blogObj = {
            ...obj,
            blogid: doc.id,
            blogDel: doc.ref,
            blogUnPub: doc.ref,
            // addedAt: obj.addedAt ? obj.addedAt.toDate() : null
          };
          return blogObj;
        });
        setBlogs(allBlogs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    // console.log("blogid"  + blogid);
    fetchAllBlogs();
  }, [user]);

  const deleteBlog = async (blogDel) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const blogRef = doc(db, "blogs", blogDel.id); // Use document ID
          await updateDoc(blogRef, { Delete: true });
          setBlogs((prevBlogs) =>
            prevBlogs.filter((blog) => blog.blogDel !== blogDel)
          );

          Swal.fire({
            title: "Deleted!",
            text: "Your file has been deleted.",
            icon: "success",
          });
        } catch (e) {
          Swal.fire({
            title: "Error",
            text: "An error occurred while deleting the blog.",
            icon: "error",
          });
        }
      }
    });
  };

  const unPublish = async (blogUnPub) => {
    if (!blogUnPub || !blogUnPub.id) {
      console.error("Invalid blogUnPub object:", blogUnPub);
      return; // Exit the function if blogUnPub is not valid
    }

    try {
      const blogRef = doc(db, "blogs", blogUnPub.id); // Use document ID
      await updateDoc(blogRef, { Hold: true });
      setBlogs((prevBlogs) =>
        prevBlogs.filter((blog) => blog.blogid !== blogUnPub.id)
      );
      // Optionally, update the local state or notify the user here if needed
      // Swal.fire({
      //   title: "Success",
      //   text: "Blog has been unpublished.",
      //   icon: "success",
      // });
    } catch (e) {
      console.error("Error updating document:", e);
      Swal.fire({
        title: "Error",
        text: "An error occurred while updating the blog.",
        icon: "error",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-infinity loading-lg"></span>
      </div>
    );
  }

  return (
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
                <li
                  className="cursor-pointer hover:bg-slate-100 active:bg-blue-500 p-3"
                  onClick={() => deleteBlog(data.blogDel)}
                >
                  Delete
                </li>
                <li
                  className="cursor-pointer hover:bg-slate-100 active:bg-blue-500 p-3"
                  onClick={() => {
                    unPublish(data.blogUnPub);
                  }}
                >
                  {"UnPublish"}
                </li>
              </ul>
            </div>
            <div className="card-body">
              <h2 className="card-title">
                {" "}
                Author Name :{" "}
                {data.authorName.length > 6
                  ? data.authorName.slice(0, 6) + "..."
                  : data.authorName}
              </h2>{" "}
              <h2 className="card-title ">
                Title :{" "}
                {data.title.length > 10
                  ? data.title.slice(0, 10) + "..."
                  : data.title}
              </h2>
              <p className="break-words">
                Blog :{" "}
                {data.blog.length > 50
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
