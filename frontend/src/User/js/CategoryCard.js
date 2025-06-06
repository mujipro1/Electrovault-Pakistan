import "../css/CategoryCard.css";
import { IoIosStar } from "react-icons/io";
import { useNavigate } from "react-router-dom";


const CategoryCard = ({ title, description, navigateTo }) => {
    const navigate = useNavigate();
    return (
        <>
            <div className="p-2 br-lg mx-2 category-card" onClick={() => { navigate(`/category/${navigateTo}`) }}>
                <div className="cat-cir"></div>
                <div className="cat-cir2"></div>
                <div className="cat-cir3"></div>
                <h5 className="font-roboto">{title}</h5>

                {/* slice to 2 words and add ... if exceeding */}
                {description.split(" ").length > 4 ? (
                    <span className="pc-card-description cc-div">{description.split(" ").slice(0, 2).join(" ")} ...</span>
                ) : (
                    <span className="pc-card-description cc-div">{description}</span>
                )}

            </div>
        </>
    );
}

export default CategoryCard;