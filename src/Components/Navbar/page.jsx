// Navbar.js
"use client";

import { useState } from "react";




export default function Navbar() {


  
  return (
    <>
      <div
        className={`flex justify-between navbar bg-blue-500 text-primary-content`}
      >
        <p className="text-xl font-bold underline">Blog Web</p>
        <label className="swap swap-rotate">
          <input type="checkbox" />

          {/* Your SVG icons */}
          <svg
            className="swap-off h-10 w-10 fill-current"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            {/* SVG path */}
          </svg>
          <svg
            className="swap-on h-10 w-10 fill-current"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            {/* SVG path */}
          </svg>
        </label>
      </div>
    </>
  );
}

