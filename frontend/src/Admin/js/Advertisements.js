import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { HomeIcon } from 'lucide-react';
import { Buffer } from 'buffer'; // Import Buffer

const Advertisements = () => {
    const navigate = useNavigate();
    const [ads, setAds] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedAdNumber, setSelectedAdNumber] = useState(null);

    useEffect(() => {
        const fetchAds = async () => {
            try {
                const response = await axios.get('/api/ads/getAllAds');
                if (response.status === 200) {
                    // Set the ads data as is (no image decoding here)
                    setAds(response.data);
                }
            } catch (error) {
                console.error('Error fetching ads:', error);
            }
        };
        fetchAds();
    }, []);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleAdChange = async (adNumber) => {
        if (!selectedFile) {
            alert('Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('ad_number', adNumber);

        try {
            const response = await axios.post('/api/ads/updateAd', formData);
            if (response.status === 200) {
                alert('Ad updated successfully.');
                setSelectedFile(null);
                setSelectedAdNumber(null);
                // Refresh ads
                const updatedAds = await axios.get('/api/ads/getAllAds');
                setAds(updatedAds.data);
            }
        } catch (error) {
            console.error('Error updating ad:', error);
        }
    };

    const adPlaceholders = [
        { ad_number: "1", label: 'Horizontal - 1440 x 900', title: 'Home Page Ad 1' },
        { ad_number: "2", label: 'Vertical - 450 x 800', title: 'Home Page Ad 2' },
        { ad_number: "3", label: 'Horizontal - 1920 x 800', title: 'Home Page Ad 3' },
        { ad_number: "4", label: 'Horizontal - 1920 x 800', title: 'Product Page Ad 1' },
    ];

    // Function to decode image data to base64
    const decodeImage = (image) => {
        if (image && image.data) {
            const base64Image = Buffer.from(image.data).toString('base64');
            return `data:${image.contentType || 'image/jpeg'};base64,${base64Image}`;
        }
        return null;
    };

    return (
        <>
            <div className="single-product pt-5">
                <p className='back-btn text-of-app'>
                    <HomeIcon className="cursor-pointer" 
                        onClick={() => navigate(`/admin/`)} 
                        style={{width: "18px", color:"black", transform: "translateY(-1px)"}}/>
                    &nbsp; /&nbsp;&nbsp;Ads
                </p>

                <div className="d-flex justify-content-center flex-column align-items-center py-3">
                    <h3 className="text-of-app">Advertisements</h3>
                    <p className="text-secondary" style={{marginLeft:"10px"}}> Manage Your Ads here</p>
                </div>

                <div className="row p-4 m-0">
                    {adPlaceholders.map((placeholder) => {
                        const ad = ads.find(a => a.ad_number == placeholder.ad_number) || {};
                        // Decode image when rendering
                        const imageUrl = decodeImage(ad.image);
                        return (
                            <div className="col-md-6 p-3" key={placeholder.ad_number}>
                                <div className="ads-container">
                                    <h4 className="text-of-app">{placeholder.title}</h4>
                                    <div className='text-secondary'>{placeholder.label}</div>
                                    {imageUrl ? (
                                        <img src={imageUrl} alt={`Ad ${placeholder.ad_number}`} className="ad-img my-3" />
                                    ) : (
                                        <div className="text-secondary my-3">No ad uploaded yet</div>
                                    )}
                                    <input
                                        type="file"
                                        className="form-control mb-3"
                                        onChange={handleFileChange}
                                    />
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleAdChange(placeholder.ad_number)}
                                    >
                                        {imageUrl ? 'Change Ad' : 'Upload Ad'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default Advertisements;
