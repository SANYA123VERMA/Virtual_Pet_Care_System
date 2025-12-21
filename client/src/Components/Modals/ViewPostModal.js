import React from 'react';
import { Modal } from 'react-bootstrap';
import PostCard from '../Community/PostCard';

const ViewPostModal = ({ show, handleClose, post, refreshPosts }) => {
    return (
        <Modal show={show} onHide={handleClose} centered size="lg" scrollable>
            <Modal.Header closeButton>
                <Modal.Title>Post Details</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0">
                {post && <PostCard post={post} refreshPosts={refreshPosts} />}
            </Modal.Body>
        </Modal>
    );
};

export default ViewPostModal;
