import React from "react";
import { Modal, Button } from "react-bootstrap";

const AddPostModal = ({
    show,
    handleClose,
    handleSubmit,
    pets,
    selectedPet,
    setSelectedPet,
    newCaption,
    setNewCaption,
    selectedCategory,
    setSelectedCategory,
    tags,
    setTags,
    setFile
}) => {
    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton className="bg-primary text-white">
                <Modal.Title>Create a Post 🐶</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-bold">Barked by:</label>
                        <select
                            className="form-select"
                            value={selectedPet}
                            onChange={(e) => setSelectedPet(e.target.value)}
                            required
                        >
                            <option value="">Select your pet...</option>
                            {pets.map(pet => (
                                <option key={pet._id} value={pet._id}>{pet.PetName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-bold">Category</label>
                        <select
                            className="form-select"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="Dog">Dog</option>
                            <option value="Cat">Cat</option>
                            <option value="Bird">Bird</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-bold">Content</label>
                        <textarea
                            className="form-control"
                            rows="3"
                            placeholder="What's happening?"
                            value={newCaption}
                            onChange={(e) => setNewCaption(e.target.value)}
                            required
                        ></textarea>
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-bold">Photo / Video</label>
                        <input
                            type="file"
                            accept="image/*, video/*"
                            className="form-control"
                            onChange={(e) => setFile(e.target.files[0])}
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-bold">Tags</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Tags (e.g. PlayTime, Food)"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                        />
                    </div>

                    <div className="d-grid mt-4">
                        <Button variant="primary" type="submit" className="rounded-pill btn-lg">
                            Bark it!
                        </Button>
                    </div>
                </form>
            </Modal.Body>
        </Modal>
    );
};

export default AddPostModal;
