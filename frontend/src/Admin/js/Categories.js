import { useEffect, useState } from "react";
import { HomeIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Categories = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState({ title: "", description: "" });
    const [editCategory, setEditCategory] = useState({ id: null, title: "", description: "" });

    const fetchCategories = async () => {
        try {
            const response = await axios.get("/api/categories/");
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const handleAddCategory = async () => {
        try {
            await axios.post("/api/categories/add", newCategory);
            setNewCategory({ title: "", description: "" });
            fetchCategories();
        } catch (error) {
            console.error("Error adding category:", error);
        }
    };

    const handleEditCategory = async () => {
        try {
            await axios.post("/api/categories/edit", editCategory);
            setEditCategory({ id: null, title: "", description: "" });
            fetchCategories();
        } catch (error) {
            console.error("Error editing category:", error);
        }
    };

    const handleDeleteCategory = async (id) => {
        try {
            await axios.delete(`/api/categories/${id}`);
            fetchCategories();
        } catch (error) {
            console.error("Error deleting category:", error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <>
            <div className="seller-data">
                <p className="back-btn text-of-app">
                    <HomeIcon
                        className="cursor-pointer"
                        onClick={() => navigate(`/admin/`)}
                        style={{ width: "18px", color: "var(--text-of-app)", transform: "translateY(-1px)" }}
                    />
                    &nbsp; /&nbsp; <span className="cursor-pointer">Categories</span>
                </p>

                <div className="d-flex justify-content-center">
                    <h4 className="text-of-app">Categories</h4>
                </div>

                <div className="mt-5">
                    <h5 className="text-of-app">Add New Category</h5>
                    <div className="d-flex justify-content-center">
                        <input
                            type="text"
                            className="form-control w-25"
                            placeholder="Title"
                            value={newCategory.title}
                            onChange={(e) =>
                                setNewCategory({ ...newCategory, title: e.target.value })
                            }
                        />
                        <input
                            type="text"
                            className="form-control w-50 mx-2"
                            placeholder="Description"
                            value={newCategory.description}
                            onChange={(e) =>
                                setNewCategory({ ...newCategory, description: e.target.value })
                            }
                        />
                        <button className="btn btn-success mx-2" onClick={handleAddCategory}>
                            Add
                        </button>
                    </div>
                </div>

                <div className="categories-container mt-5">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Description</th>
                                <th>Product Count</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((category) => (
                                <tr key={category.id}>
                                    <td>
                                        {editCategory.id === category.id ? (
                                            <input
                                                type="text"
                                                className="form-control text-dark"
                                                value={editCategory.title}
                                                onChange={(e) =>
                                                    setEditCategory({ ...editCategory, title: e.target.value })
                                                }
                                            />
                                        ) : (
                                            category.title
                                        )}
                                    </td>
                                    <td>
                                        {editCategory.id === category.id ? (
                                            <input
                                                className="form-control text-dark"
                                                type="text"
                                                value={editCategory.description}
                                                onChange={(e) =>
                                                    setEditCategory({ ...editCategory, description: e.target.value })
                                                }
                                            />
                                        ) : (
                                            category.description
                                        )}
                                    </td>
                                    <td>{category.product_count}</td>
                                    <td>
                                        {editCategory.id === category.id ? (
                                            <button className="btn btn-success" onClick={handleEditCategory}>
                                                Save
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    className="btn btn-success"
                                                    onClick={() =>
                                                        setEditCategory({
                                                            id: category.id,
                                                            title: category.title,
                                                            description: category.description,
                                                        })
                                                    }
                                                >
                                                    Edit
                                                </button>
                                                {category.product_count === 0 && (
                                                    <button
                                                        className="btn btn-danger mx-2"
                                                        onClick={() => handleDeleteCategory(category.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default Categories;