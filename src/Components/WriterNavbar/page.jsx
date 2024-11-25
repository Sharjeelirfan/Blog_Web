"use client";

import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/firebaseconfig";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Link from "next/link";

export default function WriterNavbar({username}) {

    const route = useRouter()

  const signout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, sign me out!",
    }).then((result) => {
      if (result.isConfirmed) {
        signOut(auth)
          .then(() => {
            Swal.fire({
              title: "Signed out!",
              text: "You have been signed out successfully.",
              icon: "success",
            }).then(() => {
              route.push("/Login"); // Redirect after signing out
            });
          })
          .catch((error) => {
            // Handle error
            Swal.fire({
              title: "Error!",
              text: error,
              icon: "error",
            });
          });
      }
    });
  };


  return (
    <>
      <div className="navbar bg-blue-500 text-black">
        <div className="navbar-start">
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content  bg-blue-500 rounded-box z-[1] mt-3 w-52 p-2 shadow"
            >
              <li> Username : {username}</li>
              <li>
                <Link href="/Writer/CreateNewBlog">Create New Blog</Link>
              </li>
              <li>
                <Link href={"/Writer/UnPublishedBlogs"}>Unpublished Blogs</Link>
              </li>

              {/* <li>
                <a>Item 3</a>
              </li> */}
            </ul>
          </div>
          <Link href={"/Writer"} className="btn btn-ghost text-xl">
            Blog_Web
          </Link>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <li className="font-bold text-xl">
              <Link href="/Writer/CreateNewBlog">Create New Blog</Link>
            </li>
            <li className="font-bold text-xl">
              <Link href={"/Writer/UnPublishedBlogs"}>Unpublished Blogs</Link>
            </li>
            <li className="font-bold mt-1 text-2xl">Username : {username}</li>
            {/* <li className="font-bold">
              <details>
                <summary>Parent</summary>
                <ul className="p-2 bg-primary">
                  <li>
                    <a>Submenu 1</a>
                  </li>
                  <li>
                    <a>Submenu 2</a>
                  </li>
                </ul>
              </details>
            </li> */}
            {/* <li className="font-bold text-xl">
              <a>Item 3</a>
            </li> */}
          </ul>
        </div>
        <div className="navbar-end">
          {/* <h1 className="mr-5 text-2xl font-bold">{username}</h1> */}
          <a className="btn" onClick={signout}>
            LogOut
          </a>
        </div>
      </div>
    </>
  );
}
