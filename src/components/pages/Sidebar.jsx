import React, { useContext, useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  AiOutlineHome,
  AiOutlineSearch,
  AiOutlineCompass,
  AiOutlinePlusCircle,
} from "react-icons/ai";


import { FiLogOut } from "react-icons/fi";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  Progress,
  Button,
  InputGroup,
} from "@chakra-ui/react";

import { Spinner } from "@chakra-ui/react";
import { AuthContext } from "../context/AuthContext";
import { auth, storage, firestore } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {
  Timestamp,
  addDoc,
  arrayUnion,
  collection,
  doc,
  query,
  where,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { v4 as uuid } from "uuid";

import { signOut } from "firebase/auth";

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const [modelOpen, setModelOpen] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [caption, setCaption] = useState("");

  const [images, setImages] = useState(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // State to store the search query
  const [searchResults, setSearchResults] = useState([]); // State to store search results
  const [userNotFound, setUserNotFound] = useState(false);
  // Define a useEffect to handle user search as you type
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      setUserNotFound(false);
      return;
    }

    const searchUsers = async () => {
      // Perform a Firestore query to search for users
      const usersRef = collection(firestore, "user"); // Use your actual Firestore collection name
      const q = query(usersRef, where("username", "==", searchQuery));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.size === 0) {
        // No users found
        setUserNotFound(true);
        setSearchResults([]);
      } else {
        // Users found
        const foundUsers = [];
        querySnapshot.forEach((doc) => {
          foundUsers.push(doc.data());
        });
        setSearchResults(foundUsers);
        setUserNotFound(false);
      }
    };

    searchUsers();
  }, [searchQuery]);

  const uploadImage = async (e) => {
    e.preventDefault();
    const storageRef = ref(storage, `users/${user?.uid}/posts/${uuid()}`);
    const uploadSingleImage = uploadBytesResumable(storageRef, images[0]);
    uploadSingleImage.on(
      "state_changed",
      (snap) => {
        setUploading(true);
        setPercentage((snap.bytesTransferred / snap.totalBytes) * 100);
      },
      (err) => console.log(err),
      () => {
        getDownloadURL(uploadSingleImage.snapshot.ref).then(
          async (downloadURL) => {
            console.log("File available at", downloadURL);
            const postDoc = await addDoc(collection(firestore, "posts"), {
              caption,
              createdAt: Timestamp.now(),
              singleMedia: { src: downloadURL },
              user: {
                fullname: user?.displayName,
                username: user?.username,
                photoURL: user?.photoURL,
                uid: user?.uid,
              },
            });
            console.log(postDoc?.id);
            setDoc(
              doc(firestore, `user/${user?.uid}`),
              {
                posts: arrayUnion(postDoc.id),
              },
              {
                merge: true,
              }
            ).then(() => {
              setModelOpen(false);
              setUploading(false);
              setUploadComplete(true);
              setCaption("");
              setImages(null);
              setUploadComplete(false);
              setPercentage(0);
              window.location.reload();
            });
          }
        );
      }
    );
  };

  return (
    <>
      <div className="sticky top-0 h-[100vh] border-l-gray-500  ">
        <div className="flex flex-col justify-between h-full px-3 border-r-2">
          <div>
            <div className="pt-10 relative">
              <img src="images/logo.png" alt="logo" className=" w-25 hidden sm:block" />
              <img src='insta_logo.png' alt="Small Logo" className="w-10 sm:hidden"/>
            </div>

            <div>
              <div className="mt-3">
                <NavLink
                  to="/"
                  className="flex cursor-pointer justify-start items-center text-lg mr-5 hover:bg-gray-200 rounded-lg w-full font-sans p-2 mb-1 "
                >
                  <AiOutlineHome className="mr-3 text-3xl" />
                  <span className="">Home</span>
                </NavLink>
                <button
                  onClick={() => setSearchOpen(true)}
                  className="flex cursor-pointer justify-start items-center text-lg mr-5 hover:bg-gray-200 rounded-lg w-full font-sans p-3 mb-1 "
                >
                  <AiOutlineSearch className="mr-3 text-3xl" />
                  Search
                </button>
                {searchOpen && (
                  <Modal
                    isOpen={searchOpen}
                    onClose={() => setSearchOpen(false)}
                  >
                    <ModalOverlay />
                    <ModalContent>
                      <ModalHeader>Search</ModalHeader>
                      <ModalCloseButton />
                      <ModalBody>
                        <div className="flex flex-col items-center">
                          <InputGroup size="md" className="mb-4">
                            <Input
                              placeholder="Search..."
                              variant="filled"
                              bg="white"
                              autoFocus
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            
                          </InputGroup>

                          {/* Display search results */}
                          {userNotFound ? (
                            <p>User not found</p>
                          ) : (
                            <ul className="w-full">
                              {searchResults.map((user) => (
                                <li
                                  key={user.uid}
                                  className="w-full border rounded-lg p-2 mb-2 hover:bg-gray-100"
                                >
                                  <NavLink
                                    to={`/${user.username}`}
                                    className="flex items-center space-x-2"
                                  >
                                    <img
                                      src={user.photoURL}
                                      alt={user.username}
                                      className="w-10 h-10 rounded-full"
                                    />
                                    <span className="text-gray-800 text-lg">
                                      {user.username}
                                    </span>
                                  </NavLink>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </ModalBody>
                    </ModalContent>
                  </Modal>
                )}
                <NavLink
                  to="/explore"
                  className="flex cursor-pointer justify-start items-center text-lg mr-5 hover:bg-gray-200 rounded-lg w-full font-sans p-2 mb-1 "
                >
                  <AiOutlineCompass className="mr-3 text-3xl" />
                  Explore
                </NavLink>

                <button
                  onClick={() => setModelOpen(true)}
                  className="flex cursor-pointer justify-start items-center text-lg mr-5 hover:bg-gray-200 rounded-lg w-full font-sans p-2 mb-1 "
                >
                  <AiOutlinePlusCircle className="mr-3 text-3xl" />
                  Create
                </button>

                <NavLink
                  to={`/${user?.username}`}
                  className="flex cursor-pointer justify-start items-center text-lg mr-5 hover:bg-gray-200 rounded-lg w-full font-sans p-2 mb-1 "
                >
                <div className="flex ">
                <div className="mr-3 text-3xl ">
                <img className="w-6 h-6 rounded-full object-cover" src={
                            user?.photoURL ||
                            "https://parkridgevet.com.au/wp-content/uploads/2020/11/Profile-300x300.png"
                          }
                          alt={user?.fullName}/> </div>
                  Profile
                </div>
                  
                </NavLink>
              </div>
            </div>
          </div>
          <button
            onClick={() => logout(auth)}
            className="flex items-center cursor-pointer pb-10 hover:bg-gray-200"
          >
            <FiLogOut className="text-lg" />
            <p className="ml-5 text-xl font-sans">Logout</p>
          </button>
        </div>
      </div>
      {modelOpen && (
        <Modal isOpen={modelOpen} onClose={() => setModelOpen(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create Post</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <div className="max-w-[422px] w-full h-full aspect-square flex items-center justify-center">
                <div className="flex flex-col w-full overflow-hidden items-center justify-between gap-4">
                  {images ? (
                    <>
                      {images.length === 1 ? (
                        <img
                          src={URL.createObjectURL(images[0])}
                          className="max-h-[300px] w-80 h-80 object-cover"
                          alt=""
                        />
                      ) : (
                        <div className="relative">
                          <div className="flex gap-3 overflow-x-scroll snap-x">
                            {Array.from(images)?.map((media, index) => (
                              <div
                                key={index}
                                className="flex-shrink-0 h-full w-full snap-center"
                              >
                                <img
                                  src={URL.createObjectURL(media)}
                                  className="border"
                                  alt=""
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <svg
                    // Your SVG code here
                    ></svg>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    id="formFile"
                    onChange={(e) => {
                      setImages(e.target.files);
                    }}
                  />
                  <Input
                    type="text"
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Add a caption"
                    value={caption}
                  />
                  {uploading && (
                    <Progress
                      value={percentage}
                      size="sm"
                      colorScheme="blue"
                      isAnimated
                    />
                  )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                colorScheme="blue"
                onClick={uploadImage}
                isDisabled={uploading || !images || caption.length === 0}
              >
                {uploading ? (
                  <div className="flex gap-2 items-center">
                    <div>Uploading</div>
                    <Spinner w="3" h="3" animate="spin" my="1" mx="auto" />
                  </div>
                ) : (
                  <>{uploadComplete ? "Complete" : "Upload"}</>
                )}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default Sidebar;
