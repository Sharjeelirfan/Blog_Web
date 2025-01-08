"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/firebase/firebaseconfig";
import { useRouter } from "next/navigation";
import ReaderNavbar from "@/Components/ReaderNavbar/page";
import { collection, getDocs, query, where } from "firebase/firestore";
import { formatDistanceStrict } from "date-fns";
import bookmark from "/assets/bookmark.png";
import bookmark1 from "/assets/save-instagram.png";
import Image from "next/image";

export default function Reader() {
  const route = useRouter();
  const [nameOfUser, setnameOfUser] = useState("Guest");
  const [blog, setBlog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllBlogs = async () => {
      const blogRef = collection(db, "blogs");
      const blogQuery = query(
        blogRef,
        where("Hold", "==", false),
        where("Delete", "==", false)
      );

      try {
        const allBlogsSnapshot = await getDocs(blogQuery);
        const allBlogs = allBlogsSnapshot.docs.map((doc) => ({
          ...doc.data(),
          blogid: doc.id,
          delDoc: doc.ref,
        }));
        setBlog(allBlogs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchAllBlogs();
  }, []);

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
      {blog.map((data) => (
        <div
          key={data.blogid}
          className="card bg-base-300 w-80 ml-10 min-h-44 mt-5 inline-block shadow-xl"
        >
          <label className="swap absolute top-1 right-2">
            <input type="checkbox" />
            <div className="swap-on">
              <Image src={bookmark} width={30} height={30} alt="Bookmark" />
            </div>
            <div className="swap-off">
              <Image src={bookmark1} width={30} height={30} alt="Save" />
            </div>
          </label>
          <div className="card-body">
            <h2 className="card-title">
              AuthorName:{" "}
              {data.authorName.length > 8
                ? data.authorName.slice(0, 8) + "..."
                : data.authorName}
            </h2>
            <h2 className="card-title">
              Title:{" "}
              {data.title.length > 10
                ? data.title.slice(0, 10) + "..."
                : data.title}
            </h2>
            <p className="break-words">
              Blog:{" "}
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
              {data.addedAt
                ? formatDistanceStrict(data.addedAt.toDate(), new Date(), {
                    addSuffix: true,
                  })
                : "Date not available"}
            </p>
            <p>{data.uploder ? `${data.uploder} upload this blog.` : null}</p>
          </div>
        </div>
      ))}
    </>
  );
}
