import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import PostCard from "../Components/Community/PostCard";
import UserContext from "../Context/UserContext";
import PetContext from "../Context/PetContext";
import AddPostModal from "../Components/Modals/AddPostModal";
import ViewPostModal from "../Components/Modals/ViewPostModal";

const Profile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userData } = useContext(UserContext);
    const { pets } = useContext(PetContext);

    const [posts, setPosts] = useState([]);
    const [userProfileName, setUserProfileName] = useState("User");
    const [loading, setLoading] = useState(true);

    // New Post State
    const [showModal, setShowModal] = useState(false);
    const [newCaption, setNewCaption] = useState("");
    const [selectedPet, setSelectedPet] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Dog");
    const [file, setFile] = useState(null);
    const [tags, setTags] = useState("");

    // View Post Modal State
    const [selectedPost, setSelectedPost] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);

    const loadUserPosts = async () => {
        if (!id || id === "undefined") {
            setLoading(false);
            return;
        }

        try {
            const { data } = await axios.get(`/posts/user/${id}`, {
                headers: { "x-auth-token": localStorage.getItem("auth-token") },
            });
            setPosts(data);
            if (data.length > 0) {
                setUserProfileName(data[0].ownerName);
            }
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const handleMessage = async () => {
        if (!userData.user) return alert("Please login to message");
        try {
            const res = await axios.post("/chats/initiate",
                { targetUserId: id },
                { headers: { "x-auth-token": localStorage.getItem("auth-token") } }
            );
            navigate("/chat", { state: { chatId: res.data._id } });
        } catch (err) {
            console.log(err);
        }
    };

    const handlePostSubmit = async (e) => {
        e.preventDefault();

        if (!selectedPet) {
            toast.error("Please select which pet is posting!");
            return;
        }

        const pet = pets.find(p => p._id === selectedPet);
        if (!pet) return;

        const formData = new FormData();
        formData.append("petName", pet.PetName);
        formData.append("ownerName", userData.user.displayName);
        formData.append("caption", newCaption);
        formData.append("category", selectedCategory);

        // Process tags
        const tagsArray = tags.split(",").map(t => t.trim()).filter(t => t !== "");
        formData.append("tags", JSON.stringify(tagsArray));

        if (file) {
            formData.append("file", file);
        }

        try {
            await axios.post("/posts", formData, {
                headers: {
                    "x-auth-token": localStorage.getItem("auth-token"),
                    "Content-Type": "multipart/form-data"
                }
            });
            toast.success("Barked successfully!");
            setNewCaption("");
            setFile(null);
            setTags("");
            setShowModal(false);
            loadUserPosts(); // Refresh profile posts
        } catch (err) {
            console.log(err);
            toast.error("Failed to post");
        }
    };

    const handlePostClick = (post) => {
        setSelectedPost(post);
        setShowViewModal(true);
    };

    const isOwnProfile = userData.user && (userData.user.id === id || userData.user._id === id);

    useEffect(() => {
        loadUserPosts();
    }, [id]);

    return (
        <div className="container mt-4">
            <div className="card shadow-sm mb-4 border-0" style={{ borderRadius: "20px" }}>
                <div className="card-body text-center">
                    <div
                        className="rounded-circle bg-primary text-white d-inline-flex justify-content-center align-items-center mb-3"
                        style={{ width: "80px", height: "80px", fontSize: "2.5rem" }}
                    >
                        <i className="bi bi-person"></i>
                    </div>
                    <h2 style={{ fontWeight: "bold" }}>{userProfileName}'s Profile</h2>

                    {!isOwnProfile && userData.user && (
                        <button className="btn btn-outline-primary mt-2 rounded-pill px-4" onClick={handleMessage}>
                            <i className="bi bi-chat-dots-fill me-2"></i> Message
                        </button>
                    )}

                    {isOwnProfile && (
                        <button
                            className="btn btn-primary mt-2 rounded-pill px-4 shadow-sm"
                            onClick={() => setShowModal(true)}
                        >
                            <i className="bi bi-plus-circle me-2"></i> Create Post
                        </button>
                    )}

                    <p className="text-muted mt-2">Viewing all posts from this user</p>
                </div>
            </div>

            <div className="row justify-content-center">
                <div className="col-md-10">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        posts.length > 0 ? (
                            <div className="row g-2">
                                {posts.map(post => (
                                    <div key={post._id} className="col-4" onClick={() => handlePostClick(post)} style={{ cursor: "pointer" }}>
                                        <div className="ratio ratio-1x1 bg-light border rounded overflow-hidden position-relative shadow-sm" style={{ borderRadius: "10px" }}>
                                            {post.image ? (
                                                (post.mediaType === "video" || post.image.match(/\.(mp4|webm|ogg|mov)$/i)) ? (
                                                    <video
                                                        src={post.image}
                                                        className="w-100 h-100"
                                                        style={{ objectFit: "cover" }}
                                                        muted
                                                    />
                                                ) : (
                                                    <img
                                                        src={post.image}
                                                        alt="Post"
                                                        className="w-100 h-100"
                                                        style={{ objectFit: "cover" }}
                                                    />
                                                )
                                            ) : (
                                                <div className="d-flex justify-content-center align-items-center w-100 h-100 text-muted">
                                                    <i className="bi bi-chat-text" style={{ fontSize: "2rem" }}></i>
                                                </div>
                                            )}
                                            {(post.mediaType === "video" || (post.image && post.image.match(/\.(mp4|webm|ogg|mov)$/i))) && (
                                                <div className="position-absolute top-0 end-0 p-1">
                                                    <i className="bi bi-film text-white" style={{ textShadow: "0 0 4px rgba(0,0,0,0.8)" }}></i>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-muted py-5">
                                <h3>No posts found for this user.</h3>
                            </div>
                        )
                    )}
                </div>
            </div>

            <AddPostModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                handleSubmit={handlePostSubmit}
                pets={pets}
                selectedPet={selectedPet}
                setSelectedPet={setSelectedPet}
                newCaption={newCaption}
                setNewCaption={setNewCaption}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                tags={tags}
                setTags={setTags}
                setFile={setFile}
            />

            <ViewPostModal
                show={showViewModal}
                handleClose={() => setShowViewModal(false)}
                post={selectedPost}
                refreshPosts={loadUserPosts}
            />
        </div>
    );
};

export default Profile;
