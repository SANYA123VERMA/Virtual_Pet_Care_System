import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import PostCard from "../Components/Community/PostCard";
import PetContext from "../Context/PetContext";
import UserContext from "../Context/UserContext";

const Community = () => {
    const { userData } = useContext(UserContext);
    const { pets } = useContext(PetContext);

    const [posts, setPosts] = useState([]);
    const [filter, setFilter] = useState("All");
    const [loading, setLoading] = useState(true);

    // Daily Bark Question
    const dailyQuestions = [
        "What is your pet's favorite sleeping spot?",
        "Does your pet have a funny habit? Share it!",
        "What is your pet's favorite treat?",
        "Show us your pet's best trick!",
        "Where does your pet love to go for a walk?"
    ];
    const [dailyBark] = useState(dailyQuestions[Math.floor(Math.random() * dailyQuestions.length)]);

    useEffect(() => {
        loadPosts();
    }, [filter]);

    const loadPosts = async () => {
        setLoading(true);
        try {
            let url = "/posts";
            if (filter !== "All") {
                url = `/posts/category/${filter}`;
            }

            const { data } = await axios.get(url, {
                headers: { "x-auth-token": localStorage.getItem("auth-token") }
            });
            setPosts(data);
        } catch (err) {
            console.log(err);
            // toast.error("Failed to load feed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4 mb-5">
            {/* Daily Bark Pinned Post */}
            <div className="alert alert-warning text-center shadow-sm" role="alert" style={{ borderRadius: "20px", border: "2px solid #ffc107" }}>
                <h4 className="alert-heading"><i className="bi bi-megaphone-fill"></i> The Daily Bark</h4>
                <p className="mb-0" style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{dailyBark}</p>
            </div>

            {/* Actions Bar */}
            <div className="d-flex justify-content-center align-items-center mb-4">
                {/* Filter Bar */}
                <div className="btn-group shadow-sm" role="group">
                    {["All", "Dog", "Cat", "Bird", "Other"].map(cat => (
                        <button
                            key={cat}
                            type="button"
                            className={`btn ${filter === cat ? "btn-primary" : "btn-outline-primary"}`}
                            onClick={() => setFilter(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="row justify-content-center">
                {/* Right Column: Feed (Centered) */}
                <div className="col-lg-8 col-md-10">
                    {/* Posts List */}
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        posts.length > 0 ? (
                            posts.map(post => <PostCard key={post._id} post={post} refreshPosts={loadPosts} />)
                        ) : (
                            <div className="text-center text-muted py-5">
                                <h3>No posts yet. Be the first to bark! 🐶</h3>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default Community;
