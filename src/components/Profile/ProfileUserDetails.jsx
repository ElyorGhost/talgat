import React, { useContext, useEffect, useRef, useState } from "react";
import { TbCircleDashed } from "react-icons/tb";

// framer motin
import { motion } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useNavigate, useParams } from "react-router-dom";

// firebase
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  where,
} from "firebase/firestore";
// components
import ProfilePostCard from "./ProfilePostCard";

import { firestore, storage } from "../../firebase/config";
import { AuthContext } from "../../context/AuthContext";

// icons
import { MdVerified as VerifiedIcon } from "react-icons/md";
import { MdAddAPhoto as EditProfileIcon } from "react-icons/md";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import NotFound from "../NotFound";
import Loading from "../Loading";

const ProfileUserDetails = () => {
  const params = useParams();
  const { username } = params;
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [postIds, setPostIds] = useState([]);
  const { user } = useContext(AuthContext);
  const [profileUser, setProfileUser] = useState(null);
  const profilePic = useRef();
  const [noUser, setNoUser] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getData = async () => {
      const userQuery = query(
        collection(firestore, "user"),
        where("username", "==", username)
      );
      onSnapshot(userQuery, (users) => {
        // console.log(users);
        if (!users.empty) {
          setPostIds(users?.docs[0]?.data()?.posts);
          setProfileUser({ id: users.docs[0].id, ...users?.docs[0]?.data() });
          setIsLoading(false);
          setNoUser(false);
          // console.log(noUser);
        }
        if (users.empty) {
          setProfileUser(null);
          // console.log(noUser);
          // console.log({ id: users.docs[0].id, ...users?.docs[0]?.data() });
          setIsLoading(false);
          setNoUser(true);
        }
      });
    };
    getData();
  }, [username]);

  useEffect(() => {
    const readIds = async (ids) => {
      const reads = ids.map((id) => getDoc(doc(firestore, "posts", `${id}`)));
      const result = await Promise.all(reads);
      return result?.map((doc) => ({ id: doc?.id, ...doc.data() }));
    };
    if (postIds?.length > 0) {
      const getData = async () => {
        try {
          const response = await readIds(postIds);
          if (response) {
            setPosts(response);
            // console.log(response);
          }
        } catch (error) {
          console.log(error);
        }
      };
      getData();
    }
  }, [postIds]);

  const followProfile = async () => {
    console.log("follow", profileUser);
    if (!user) navigate("/login");
    if (user) {
      setDoc(
        doc(firestore, `user/${user?.uid}`),
        {
          following: arrayUnion(profileUser?.id),
        },
        { merge: true }
      );
      setDoc(
        doc(firestore, `user/${profileUser?.id}`),
        {
          followedBy: arrayUnion(user?.uid),
        },
        { merge: true }
      );
    }
  };

  const unFollowProfile = async () => {
    console.log("follow", profileUser);
    if (!user) navigate("/login");
    if (user) {
      setDoc(
        doc(firestore, `user/${user?.uid}`),
        {
          following: arrayRemove(profileUser?.id),
        },
        { merge: true }
      );
      setDoc(
        doc(firestore, `user/${profileUser?.id}`),
        {
          followedBy: arrayRemove(user?.uid),
        },
        { merge: true }
      );
    }
  };

  return (
    <div className="py-10 w-full">
      <div className="flex items-center">
        <div className="w-[25%]">
          <img
            className="w-32 h-32 rounded-full"
            src="https://cdn.pixabay.com/photo/2013/07/18/15/09/death-164761_640.jpg"
            alt="avatar"
          />
        </div>
        <div className="space-y-5 ">
          <div className="flex space-x-10 items-center">
            <p className="text-2xl font-serif">username</p>
            <button className="bg-gray-200 hover:bg-gray-300 p-2 rounded-lg">
              Edit Profile
            </button>
            <TbCircleDashed></TbCircleDashed>
          </div>
          <div className="flex space-x-10">
            <div>
              <span className="font-semibold mr-2">10</span>
              <span>posts</span>
            </div>

            <div>
              <span className="font-semibold mr-2">17000</span>
              <span>followers</span>
            </div>
            <div>
              <span className="font-semibold mr-2">0</span>
              <span>following</span>
            </div>
          </div>
          <div>
            <p className="font-semibold">Full Name</p>
            <p className="font-thin text-sm">Coder / hacker / Ghost</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileUserDetails;
