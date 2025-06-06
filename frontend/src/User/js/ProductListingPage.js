import "../css/ProductListingPage.css";
import { useEffect, useState } from "react";
import { Buffer } from "buffer"; // Import Buffer
import ProductContainerList from "./ProductContainerList";
import axios from "axios";

const ProductListingPage = ({ panel }) => {
    const [categories, setCategories] = useState([]);
    const [singleCat, setSingleCat] = useState(null);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [searchQuery , setSearchQuery] = useState("");
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [ads , setAds] = useState([]);
    const [searchData, setSearchData] = useState([]);

    const ratingThreshold = 4.5;

    const panelInfo = {
        1: { title: "Recommended Products", description: "Handpicked just for you based on your interests." },
        2: { title: "Featured Products", description: "Top-rated products loved by customers worldwide." },
        3: { title: "Categories", description: "Browse through our product categories to find what you need." },
    };

    const fetchAds = () => {
        axios.get("/api/ads/getAllAds")
            .then(response => {
                const adsData = response.data;
                setAds(adsData);
            })
            .catch(error => console.error("Error fetching ads:", error));
    };

    useEffect(() => {
        if (panel === 5) {
            const query = window.location.pathname.split("/").pop();
            setSearchQuery(query);

             axios.post("/api/products/searchQuery/"
                , { query: query })
            .then(response => {
                setSearchData(response.data);
            })
            .catch(error => console.error("Error fetching ads:", error));

        }
    }, [panel, window.location.pathname]);

    useEffect(() => {
        if (panel === 1) {
            getRecommendedProducts(1);
        } else if (panel === 2) {
            getFeaturedProducts();
        } else if (panel === 3) {
            fetchCategories();
        } else if (panel === 4) {
            fetchCategorySingle();
        }
    }, [panel]);

    useEffect(() => {
        fetchAds();
    }, []);

    const decodeImage = (buffer) => {
        const base64String = Buffer.from(buffer).toString('base64');
        return `data:image/jpeg;base64,${base64String}`;
    }

    const getFeaturedProducts = () => {
        axios.get("/api/products")
            .then(response => {
                const products = response.data;
                setFeaturedProducts(products.filter(product => product.rating >= ratingThreshold).slice(0, 10));
            })
            .catch(error => console.error("Error fetching products:", error));
    };

    const getRecommendedProducts = async (userId) => {
        try {
            const response = await axios.get(`/api/products/recommended-products/${userId}`);
            setRecommendedProducts(response.data.recommended);
            console.log("Recommended products:", response.data.recommended);
        } catch (error) {
            console.error("Error fetching recommended products:", error);
        }
    };

    const fetchCategories = () => {
        axios.get("/api/categories")
            .then(response => setCategories(response.data))
            .catch(error => console.error("Error fetching categories:", error));
    };

    const fetchCategorySingle = () => {
        const categoryId = window.location.pathname.split("/").pop();
        axios.get(`/api/categories/single/${categoryId}`)
            .then(response => {
                setSingleCat(response.data); // <-- Fix here
            })
            .catch(error => console.error("Error fetching category:", error));
    };

    return (
        <div className="product-listing-page">
            {(panel !== 3 && panel !== 4 && panel !== 5) && (
                <ProductContainerList
                    title={panelInfo[panel]?.title || "Products"}
                    description={panelInfo[panel]?.description || "Browse our collection of amazing products."}
                    navigateTo={'recommended-for-you'}
                    data={panel === 1 ? recommendedProducts : featuredProducts}
                    hideSeeAll={1}
                />
            )}

            {panel === 3 && (
                <ProductContainerList
                    title={"Explore Our Categories"}
                    description={"Browse through our product categories to find what you need."}
                    data={categories}
                    isCategoryList={1}
                    hideSeeAll={1}
                />
            )}

            {panel === 4 && singleCat && (
                <ProductContainerList
                    title={singleCat.title}
                    description={singleCat.description}
                    data={singleCat.products}
                    hideSeeAll={1}
                    isCategoryList={0}
                />
            )}
            {panel == 5 && (
                <>
                <ProductContainerList
                    title ={"Search Results"}
                    description={"Results for '" + searchQuery + "'"}
                    data={searchData}
                    hideSeeAll={1}
                />
                </>
            )}

            {
                ads.length > 0 && ads[3].image && ads[3].image.data ? (
                    <div className="ad-container-home2">
                        <img src={decodeImage(ads[3].image.data)} className="user-home-img"></img>
                    </div>
                ) : (
                //    loading text
                <h5 className="text-center text-of-app">Loading...</h5>

                )
            }
        </div>
    );
};

export default ProductListingPage;
