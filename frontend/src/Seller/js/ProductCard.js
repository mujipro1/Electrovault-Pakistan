import { IoIosStar } from "react-icons/io";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ id, title, description, image, rating, amount, isDifferentBg = 0 }) => {
    const navigate = useNavigate();
    
    const bufferToBase64 = (buffer) => {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    return (
        <>
            <div className={`br-lg product-card ${isDifferentBg == 1 ? "pc-card-border" : ""}`}
                onClick={() => { navigate(`/seller/product/details/${id}`) }}
            >
                <div className="br-sm pcard-img-container">
                    {image && image.data && image.data.length > 0 && (

                        <img
                            src={`data:image/jpeg;base64,${bufferToBase64(image.data)}`}
                            alt="Product"
                        />

                    )}

                </div>

                <h5 className="pc-card-title font-roboto mt-3">{title}</h5>
                {description.length > 50 ? (
                    <span className="pc-card-description">{description.slice(0, 70)} ...</span>
                ) : (
                    <span className="pc-card-description">{description}</span>
                )}
                

                <div className="d-flex mt-3 justify-content-between">
                    <h5>Rs.{amount}</h5>
                    <div className="rating "><IoIosStar className="pc-card-rating-star" /> {rating}</div>
                </div>
            </div>
        </>
    );
}

export default ProductCard;