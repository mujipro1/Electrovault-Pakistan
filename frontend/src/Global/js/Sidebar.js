import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../css/Sidebar.css';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories');
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <>
    <div className={`${isExpanded == true ? 'expanded' : 'sidebar'}`}>
        {isExpanded == false && (
            <div className="d-flex cursor-pointer justify-content-center flex-column align-items-end m-2"
            onClick={() => {setIsExpanded(!isExpanded)}}>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
        </div>
        )}
        {isExpanded == true && (
            <>
            <div className="d-flex mt-2 cursor-pointer justify-content-between align-items-start">
                <h5 className="mx-3 my-2">Categories</h5>

            <div className="d-flex cursor-pointer justify-content-center flex-column align-items-end m-2"
                onClick={() => {setIsExpanded(!isExpanded)}}>
                <div className="cross1"></div>
                <div className="cross2"></div>
            </div>
            </div>

            <div className="d-flex justify-content-center align-items-start flex-column">
                {categories.map((category, index) => (
                  <div key={index} onClick={()=>{navigate(`/category/${category.id}`);window.location.reload()}} className="category-sidebar px-3">{category.title}</div>
                ))}
            </div>
            </>
        )}
    </div>
    </>
  );
};

export default Sidebar;
