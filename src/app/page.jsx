"use client";

import Page from "@/app/Login/page";
import Image from "next/image";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/firebaseconfig";
import { useRouter } from "next/navigation";
import { doc , getDoc  } from "firebase/firestore";
import { db } from "@/firebase/firebaseconfig";

export default function Home() {

  const route = useRouter()

  onAuthStateChanged( auth , async (user) => {
    if (!user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/auth.user
      // const uid = user.uid;
      route.push("/Reader")
      // ...

    } else {
      // User is signed out
      // ...
      // User is logged in, check the user's role
        const userDoc = doc(db, "user", user.uid); // Reference to the user's document in Firestore
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          const userRole = userData.role; // Assuming 'role' is stored in Firestore

          // Redirect based on role
          if (userRole === "Writer") {
            route.push("/Writer"); // Redirect if the user is a User
          }else if(userRole === "Reader"){
            route.push("/Reader")
          }

          // If the user is a Writer, they can stay on this page
        } else {
          // Handle case where user data does not exist in Firestore
          console.error("User data not found in Firestore.");
          route.push("/Login");
        }
    }
  }); 
  return (
    <>
   </>
  );
}
