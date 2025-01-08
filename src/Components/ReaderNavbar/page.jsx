"use client";

import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/firebaseconfig";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Link from "next/link";


export default function ReaderNavbar( {username}) {
  const route = useRouter();

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
              text: {error},
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
              className="menu menu-sm dropdown-content bg-primary rounded-box z-[1] mt-3 w-52 p-2 shadow"
            >
              <li>
                <Link href="/Reader/savedblogs">Saved Blogs </Link>
              </li>

              {/* <li>
                <a>Item 3</a>
              </li> */}
            </ul>
          </div>
          <a className="btn btn-ghost text-xl">Blog_Web</a>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <li className="font-bold text-2xl">
              <Link href={"/Reader/savedblogs"}>Saved Blogs </Link>
            </li>

            {/* <li>
              <a>Item 3</a>
            </li> */}
          </ul>
        </div>

        <div className="navbar-end">
          {/* <h1 className="mr-5 text-2xl font-bold">Username : {username}</h1> */}
          <a className="btn" onClick={signout}>
            LogOut
          </a>
        </div>
      </div>
    </>
  );
}
