import CategoryCard from "./CategoryCard";
import ProductCard from "./ProductCard";
import "../css/ProductContainerList.css";
import { useNavigate } from "react-router-dom";

const ProductContainerList = ({title, description, navigateTo, data, isCategoryList=0, isDifferentBg=0, hideSeeAll=0}) => {
    const navigate = useNavigate();

    return (
        <>
        <div className={`product-container-list ${isDifferentBg == 1 ? 'bg-2-pclist' : ''}  py-5 p-3`}>
            
            <div className="pc-list-header d-flex flex-column align-items-center justify-content-center">
                <h2 className="mt-5 text-of-app font-roboto">{title}</h2>
                <div className="mb-4 sec-text ">{description}</div>
            </div>

            <div className="mt-4 mb-2 pclist-card-container">
                {isCategoryList == 0 && data.map((item, index) => (
                    <div key={index} className="product-container-card">
                        <ProductCard
                            id={item.id}
                            title={item.title}
                            image = {item.images ? item.images[0] : ""}
                            description={item.description}
                            rating={item.rating}
                            amount={item.price}
                            isDifferentBg={isDifferentBg}
                        />
                    </div>
                ))}
                
                {isCategoryList == 1 && data.map((item, index) => (
                    <div key={index} className="product-container-card">
                        <CategoryCard
                            title={item.title}
                            navigateTo={item.id}
                            description={item.description}
                        />
                    </div>
                ))}

            </div>
            {hideSeeAll == 0 && (
                <div className="d-flex justify-content-center my-5">
                <div className="mx-2 sec-text cursor-pointer"
                onClick={() => {navigate(`/${navigateTo}`)}}
                >See All ...</div>
            </div>
            )}
        </div>
        </>
    );
}

export default ProductContainerList;