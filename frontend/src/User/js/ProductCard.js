import "../css/ProductCard.css";
import { IoIosStar } from "react-icons/io";
import { useNavigate } from "react-router-dom";

const ProductCard = ({id, title, description, rating, amount, isDifferentBg , image}) => {
    const navigate = useNavigate();
    return (
        <>
            <div className={`p-2 br-lg  ${isDifferentBg == 1 ? "pc-card-border" : "product-card"}`}
            onClick={() => {navigate(`/product/${id}`)}}
            >
                <div className="br-sm pcard-img-container">
                    <img src={image} alt="Product" className="pc-card-img"
                    />
                </div>

                <h5 className="pc-card-title font-roboto mt-3">{title}</h5>
                <div className="pc-card-description">{description}</div>
                
                <div className="d-flex mt-3 justify-content-between">
                    <h5>Rs.{amount}</h5>
                    <div className="rating "><IoIosStar className="pc-card-rating-star" /> {rating}</div>
                </div>
            </div>
        </>
    );
}

export default ProductCard;