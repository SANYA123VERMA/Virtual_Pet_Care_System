import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Moment from "react-moment";
import { Link } from "react-router-dom";
import UserContext from "../../Context/UserContext";

const PostCard = ({ post, refreshPosts }) => {
    const { userData } = useContext(UserContext);
    const [likes, setLikes] = useState(post.likedBy ? post.likedBy.length : 0);
    const userId = userData.user ? (userData.user.id || userData.user._id) : null;
    const [liked, setLiked] = useState(post.likedBy ? post.likedBy.includes(userId) : false);

    // Reactively update 'liked' status when user data loads
    useEffect(() => {
        if (post.likedBy && userId) {
            setLiked(post.likedBy.includes(userId));
        }
    }, [post.likedBy, userId]);

    // Comment State
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState(post.comments || []);

    const handleLike = async () => {
        try {
            await axios.put(
                `/posts/like/${post._id}`,
                {},
                { headers: { "x-auth-token": localStorage.getItem("auth-token") } }
            );

            if (liked) {
                setLikes(likes - 1);
                setLiked(false);
            } else {
                setLikes(likes + 1);
                setLiked(true);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            await axios.delete(`/posts/${post._id}`, {
                headers: { "x-auth-token": localStorage.getItem("auth-token") }
            });
            toast.success("Post deleted");
            if (refreshPosts) refreshPosts();
        } catch (err) {
            toast.error("Failed to delete post");
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!commentText) return;
        try {
            const { data } = await axios.post(`/posts/comment/${post._id}`, {
                text: commentText,
                userName: userData.user.displayName
            }, {
                headers: { "x-auth-token": localStorage.getItem("auth-token") }
            });
            setComments(data.comments);
            setCommentText("");
            toast.success("Comment added!");
        } catch (err) {
            toast.error("Failed to add comment");
        }
    };

    const handleRepost = async () => {
        // Simpler repost logic: reposting with existing details but new owner
        const caption = prompt("Add a caption to your repost (optional):");
        if (caption === null) return; // Cancelled

        try {
            await axios.post(`/posts/repost/${post._id}`, {
                caption: caption
            }, {
                headers: { "x-auth-token": localStorage.getItem("auth-token") }
            });
            toast.success("Reposted to your feed!");
            if (refreshPosts) refreshPosts();
        } catch (err) {
            toast.error("Failed to repost");
        }
    };

    const isOwner = userData.user && post.ownerId && (
        String(userData.user.id) === String(post.ownerId) ||
        String(userData.user._id) === String(post.ownerId)
    );

    return (
        <div className="card mb-4 shadow-sm" style={{ borderRadius: "15px", border: "none" }}>
            <div className="card-header bg-white d-flex align-items-center" style={{ borderTopLeftRadius: "15px", borderTopRightRadius: "15px" }}>
                <div
                    className="rounded-circle bg-light d-flex justify-content-center align-items-center"
                    style={{ width: "40px", height: "40px", marginRight: "10px", fontSize: "1.2rem" }}
                >
                    🐾
                </div>
                <div>
                    <h5 className="mb-0" style={{ fontWeight: "bold", color: "#333" }}>
                        {post.ownerId ? (
                            <Link to={`/profile/${post.ownerId}`} style={{ textDecoration: "none", color: "#333" }}>{post.ownerName}</Link>
                        ) : (
                            <span>{post.ownerName}</span>
                        )}
                    </h5>
                    <small className="text-muted">
                        Barked by {post.petName}
                    </small>
                    {post.repostFrom && (
                        <div style={{ fontSize: "0.8rem", color: "#888" }}>
                            <i className="bi bi-arrow-repeat"></i> Reposted from {post.repostFrom}
                        </div>
                    )}
                </div>
                <div className="ms-auto d-flex align-items-center">
                    <small className="text-muted me-3">
                        <Moment fromNow>{post.createdAt}</Moment>
                    </small>
                    {isOwner && (
                        <button className="btn btn-sm text-danger" onClick={handleDelete} title="Delete Post">
                            <i className="bi bi-trash"></i>
                        </button>
                    )}
                </div>
            </div>

            {/* DEBUG: Remove later */}
            {console.log("Post ID:", post._id, "Image:", post.image, "Type:", post.mediaType)}

            {post.image && (
                (post.mediaType === "video" || post.image.match(/\.(mp4|webm|ogg|mov)$/i)) ? (
                    <video
                        src={post.image}
                        className="card-img-top"
                        controls
                        style={{ maxHeight: "500px", objectFit: "cover", width: "100%" }}
                    />
                ) : (
                    <img
                        src={post.image}
                        className="card-img-top"
                        alt="Post"
                        style={{ maxHeight: "500px", objectFit: "cover" }}
                    />
                )
            )}

            <div className="card-body">
                {post.category && (
                    <span className="badge rounded-pill bg-info text-dark mb-2 me-1">{post.category}</span>
                )}
                {post.tags && post.tags.map((tag, index) => (
                    <span key={index} className="badge rounded-pill bg-light text-secondary mb-2 me-1">#{tag}</span>
                ))}

                <p className="card-text mt-2" style={{ fontSize: "1.1rem" }}>
                    {post.caption}
                </p>

                <div className="d-flex align-items-center mt-3 border-top pt-3">
                    <button
                        className={`btn btn-sm ${liked ? "btn-danger" : "btn-outline-danger"} rounded-pill me-2`}
                        onClick={handleLike}
                    >
                        <i className={`bi ${liked ? "bi-heart-fill" : "bi-heart"} me-1`}></i>
                        {likes}
                    </button>

                    <button
                        className="btn btn-sm btn-outline-primary rounded-pill me-2"
                        onClick={() => setShowComments(!showComments)}
                    >
                        <i className="bi bi-chat-dots me-1"></i>
                        {comments.length}
                    </button>

                    <button
                        className="btn btn-sm btn-outline-secondary rounded-pill"
                        onClick={handleRepost}
                    >
                        <i className="bi bi-arrow-repeat me-1"></i>
                        Repost
                    </button>
                </div>

                {/* Comments Section */}
                {showComments && (
                    <div className="mt-3 bg-light p-3 rounded">
                        {comments.map((c, i) => (
                            <div key={i} className="mb-2 border-bottom pb-1">
                                <strong>{c.userName}: </strong>
                                <span>{c.text}</span>
                            </div>
                        ))}

                        <form onSubmit={handleComment} className="d-flex mt-2">
                            <input
                                type="text"
                                className="form-control form-control-sm me-2"
                                placeholder="Add a comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                required
                            />
                            <button type="submit" className="btn btn-sm btn-primary">Post</button>
                        </form>
                    </div>
                )}

            </div>
        </div>
    );
};

export default PostCard;
