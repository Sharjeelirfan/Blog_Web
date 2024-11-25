"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { db ,auth} from "@/firebase/firebaseconfig";
import { doc, getDoc } from "firebase/firestore";
import WriterNavbar from "@/Components/WriterNavbar/page";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

const BlogDetail = () => {
  let route = useRouter()
  const { blogid } = useParams(); 
  // console.log(id);
  // params : {}
  const [blog, setBlog] = useState();
  const [loading, setLoading] = useState(false); 
  const [nameOfUser, setnameOfUser] = useState();
  // const [user , setUser] = useState()

  
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
    setLoading(true)
    const fetchBlog = async () => {
      if (blogid) {
        const blogRef = doc(db, "blogs", blogid);
        try {
          const blogSnapshot = await getDoc(blogRef);
          if (blogSnapshot.exists()) {
            setBlog(blogSnapshot.data());  
            // console.log(blog);
                      
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

 if (loading) {
   return (
     <div className="flex items-center justify-center min-h-screen">
       <span className="loading loading-infinity loading-lg"></span>
     </div>
   );
 }
  if (!blog) return <h1>No blog found.</h1>; 


  return (
    <>
      <WriterNavbar username={nameOfUser} />
      <div>
        <h2 className="card-title">
          {" "}
          <span className="underline">Author Name </span> : {blog.authorName}
        </h2>{" "}
        <h2 className="card-title">
          <span className="underline">Title  </span>: {blog.title}
        </h2>{" "}
        <p>
          <span className="font-bold underline">Blog</span> : {blog.blog}
        </p>
      </div>
    </>
  );
};

export default BlogDetail;
