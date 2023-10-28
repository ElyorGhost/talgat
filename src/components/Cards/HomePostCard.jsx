import React, { useContext, useEffect, useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link } from "react-router-dom";
import { format } from "date-fns";
// Import Swiper React components
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
import { Timestamp } from "firebase/firestore";
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

// import required modules
import { Pagination } from "swiper/modules";

// import { motion } from "framer-motion";

// icons
import { CgHeart as HeartIcon } from "react-icons/cg";
import { FaHeart as HeartFillIcon } from "react-icons/fa";
import { RiChat3Line as CommentIcon } from "react-icons/ri";
import { FiSend as SendIcon } from "react-icons/fi";
import { BsEmojiSmile, BsBookmark as TagIcon } from "react-icons/bs";
import { BsBookmarkFill as TagFillIcon } from "react-icons/bs";
import { IoEllipsisHorizontalSharp as PostMenuIcon } from "react-icons/io5";
import { AiOutlineSmile as SmileIcon } from "react-icons/ai";
import { GoChevronRight as NextIcon } from "react-icons/go";
import { MdVerified as VerifiedIcon } from "react-icons/md";
import { formatDistanceToNow } from "date-fns";
import { RiDeleteBinLine } from "react-icons/ri";
//emoji
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

import {
  addDoc,
  deleteDoc,
  arrayRemove,
  collection,
  doc,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { firestore } from "../firebase";
import { AuthContext } from "../context/AuthContext";

const HomePostCard = ({ post }) => {
  const [commentInput, setCommentInput] = useState("");
  const [commentsArr, setCommentsArr] = useState([]);
  const [limitNum, setLimitNum] = useState(2);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const { user } = useContext(AuthContext);
  const swiper = useSwiper();
  const [showEmoji, setShowEmoji] = useState(false);

  const addEmoji = (e) => {
    const sym = e.unified.split("_");
    const codeArray = [];
    sym.forEach((el) => codeArray.push("0x" + el));
    let emoji = String.fromCodePoint(...codeArray);
    setCommentInput(commentInput + emoji);
  };

  const likePost = async () => {
    const postRef = doc(firestore, `posts/${post?.id}`);
    updateDoc(
      postRef,
      {
        likedBy: arrayUnion(user?.uid),
      },
      { merge: true }
    );
    setLiked(true);
  };

  const unlikePost = async () => {
    const postRef = doc(firestore, `posts/${post?.id}`);
    updateDoc(
      postRef,
      {
        likedBy: arrayRemove(user?.uid),
      },
      {
        merge: true,
      }
    );
    setLiked(false);
  };

  const savePost = async () => {
    console.log(user.uid, post.id);
    const userRef = doc(firestore, `user/${user.uid}`);
    const postRef = doc(firestore, `posts/${post.id}`);
    updateDoc(
      postRef,
      {
        savedBy: arrayUnion(user.uid),
      },
      { merge: true }
    );
    updateDoc(
      userRef,
      {
        savedPost: arrayUnion(post?.id),
      },
      { merge: true }
    );
    setSaved(true);
  };

  const unsavePost = async () => {
    const userRef = doc(firestore, `user/${user.uid}`);
    const postRef = doc(firestore, `posts/${post.id}`);
    updateDoc(
      postRef,
      {
        savedBy: arrayRemove(user.uid),
      },
      { merge: true }
    );
    updateDoc(
      userRef,
      {
        savedPost: arrayRemove(post?.id),
      },
      { merge: true }
    );
    setSaved(false);
  };

  const commentSubmit = (e) => {
    e.preventDefault();
    // console.log(post?.id, post);
    const commentsCollectionRef = collection(
      firestore,
      `posts/${post?.id}/commentsCollection`
    );
    const commentData = {
      userId: user?.uid,
      comment: commentInput.trim(),
      commentedAt: serverTimestamp(),
      username: user?.username,
      isVerified: user?.isVerified,
      fullName: user?.displayName,
      photoURL: user?.photoURL,
      likes: 0,
    };
    addDoc(commentsCollectionRef, commentData);
    setCommentInput("");
  };

  const deletePost = async () => {
    if (user && post && user.uid === post.user.uid) {
      try {
        // Delete the post document from Firestore
        const postDocRef = doc(firestore, "posts", post.id);
        await deleteDoc(postDocRef);

        // Remove the post ID from the user's posts array
        const userDocRef = doc(firestore, "user", user.uid);
        await updateDoc(userDocRef, {
          posts: arrayRemove(post.id),
        });

        // If there are images associated with the post, you can also delete them from storage.

        // Show a success message or perform any other nece
        
        // Refresh the page after a successful deletion
      window.location.reload();
      } catch (error) {
        console.error("Error deleting post:", error);
        // Handle errors or show an error message.
      }
    } else {
      // Show a message or take a different action (e.g., you can't delete this post).
    }
  };

  useEffect(() => {
    // console.log(user);
    const getComments = async () => {
      const q = query(
        collection(firestore, `posts/${post?.id}/commentsCollection`),
        limit(limitNum)
      );

      onSnapshot(
        q,
        (docs) => {
          const comments = docs.docs.map((doc) => ({
            ...doc.data(),
            id: doc?.id,
          }));
          // console.log(comments);
          setLiked(post?.likedBy?.includes(user?.uid));
          setSaved(post?.savedBy?.includes(user?.uid));
          setCommentsArr(comments);
        },
        (err) => {
          console.log(err);
        }
      );
    };
    getComments();
  }, [limitNum]);

  return (
    <div
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="sm:mb-6 border-b-2"
    >
      <div className="flex gap-3 items-center p-2 justify-between">
        <Link to={`/${post?.user?.username}`}>
          <img
            src={
              post?.user?.photoURL ||
              "https://parkridgevet.com.au/wp-content/uploads/2020/11/Profile-300x300.png"
            }
            className="rounded-full h-8 w-8 object-cover"
            alt={post?.user?.fullName}
          />
        </Link>
        <div className="flex flex-row flex-grow items-center  ">
          <Link
            to={`/${post?.user?.username}`}
            className="font-semibold text-sm"
          >
            {post?.user?.username}
          </Link>
          •
          <p className="align-top text-xs items-center">
            {post?.createdAt ? (
              <>{formatDistanceToNow(post?.createdAt.toDate())} ago</>
            ) : (
              "Unknown"
            )}
          </p>
        </div>
        {user && post && user.uid === post.user.uid && (
          <button
            className="bg-gray-200 hover:bg-gray-300 rounded-md p-1"
            onClick={deletePost}
          >
            <RiDeleteBinLine size={20} /> {/* Render the trash bin icon */}
          </button>
        )}
      </div>
      <div>
        {!post?.carouselMedia && (
          <div className="">
            <LazyLoadImage
              // effect="blur"
              src={post?.singleMedia?.src || post?.carouselMedia[0]?.src}
              placeholderSrc="https://cutewallpaper.org/24/image-placeholder-png/index-of-img.png"
              alt={post?.id}
              className="object-cover"
              style={{ width: "468px", height: "468px" }}
            />
          </div>
        )}
        {post?.carouselMedia && (
          <div className="relative">
            <Swiper
              navigation
              pagination={{ clickable: true }}
              scrollbar={{ draggable: true }}
              // onSwiper={(swiper) => console.log(swiper)}
              // onSlideChange={(e) => console.log(e)}
              modules={[Pagination]}
            >
              {post?.carouselMedia.map((media, index) => (
                <LazyLoadImage
                  src={media?.src}
                  placeholderSrc="https://cutewallpaper.org/24/image-placeholder-png/index-of-img.png"
                  alt={post?.id}
                  className="h-[468px] w-[468px] "
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    height: "100%",
                    alignItems: "center",
                  }}
                />
              ))}

              <button
                onClick={() => swiper.slideNext()}
                className="absolute top-[50%] translate-y-[-50%] rotate-180 left-3 p-1 aspect-square rounded-full bg-gray-200 text-slate-800 backdrop-opacity-40 z-50"
              >
                <NextIcon />
              </button>
            </Swiper>
          </div>
        )}
      </div>
      <div className="p-1">
        <div className="flex text-2xl md:py-3 w-full">
          <div className="flex w-full text-slate-900 gap-2">
            {liked ? (
              <button onClick={unlikePost}>
                <HeartFillIcon color="#ff2828" />
              </button>
            ) : (
              <button onClick={likePost}>
                <HeartIcon size={25} />
              </button>
            )}
            <button>
              <CommentIcon />
            </button>
            <button>
              <SendIcon />
            </button>
          </div>
          <button onClick={saved ? unsavePost : savePost}>
            {saved ? <TagFillIcon /> : <TagIcon />}
          </button>
        </div>
        <div className="text-sm font-semibold">
          {post?.likedBy?.length > 0 && (
            <>{post?.likedBy?.length?.toLocaleString()} likes</>
          )}
          <div className="my-2">
            {post?.caption && (
              <div className="text-sm text-gray-700">
                <Link to={`/${post.user.username}`} className="font-bold">
                  {post?.user?.username}
                </Link>{" "}
                {post?.caption}
              </div>
            )}
          </div>
          {commentsArr?.length > 0 && (
            <div
              onClick={() => setLimitNum(limitNum + 5)}
              className="block text-xs my-3 text-slate-600 cursor-pointer"
            >
              View more comments
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3" id="#comments">
          {commentsArr?.map((comment) => (
            // console.log(comment),
            <div key={comment?.id} className="flex justify-between  gap-2">
              <div>
                <Link to={`/${comment?.username}`}></Link>
              </div>
              <div className="flex flex-grow gap-1">
                <b className="inline-flex">
                  <Link to={`/${comment?.username}`}>{comment?.username}</Link>
                  {comment?.isVerified && (
                    <span className="aspect-square rounded-full text-blue-500">
                      <VerifiedIcon />
                    </span>
                  )}
                </b>
                <span className="font-normal">
                  {comment?.comment?.length > 20
                    ? `${comment?.comment?.slice(0, 20)}...`
                    : comment?.comment}
                </span>
              </div>
              {/* <div>{comment?.commentedAt?.toDate().toLocaleTimeString()}</div> */}
            </div>
          ))}
        </div>
      </div>
      <div className=" sm:block  text-slate-900  border-slate-500/30">
        <form
          className="flex items-start gap-2 pt-rem relative"
          onSubmit={commentSubmit}
        >
          <div className="w-full flex items-end p-2 rounded-sm">
            <textarea
              placeholder="Add a comment..."
              className="w-full bg-transparent outline-none resize-none text-sm pl-rem"
              cols="30"
              rows="1"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
            ></textarea>
            <span
              onClick={() => setShowEmoji(!showEmoji)}
              className="cursor-pointer hover:text-slate-300"
            >
              <BsEmojiSmile onClick={() => setShowEmoji(!showEmoji)} />
            </span>
          </div>
          <button
            type="submit"
            disabled={commentInput.length <= 0}
            className="text-white font-semibold text-sm bg-blue-600 box-content p-1 rounded-md"
          >
            Post
          </button>
        </form>
        {showEmoji && (
          <div className={` ${showEmoji ? "" : "hide-emoji"}`}>
            <Picker
              data={data}
              emojiSize={20}
              emojiButtonSize={28}
              onEmojiSelect={addEmoji}
              maxFrequentRows={0}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePostCard;
