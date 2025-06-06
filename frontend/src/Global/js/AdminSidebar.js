import { useState } from "react";
import '../css/Sidebar.css';
import { useNavigate } from "react-router-dom";

const AdminSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

   const [showLogoutModal, setShowLogoutModal] = useState(false);
  
    const logout = () => {
        localStorage.removeItem("adminToken");
        navigate("/");
    };

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
                <h5 className="mx-3 my-2">Admin Panel</h5>

            <div className="d-flex cursor-pointer justify-content-center flex-column align-items-end m-2"
                onClick={() => {setIsExpanded(!isExpanded)}}>
                <div className="cross1"></div>
                <div className="cross2"></div>
            </div>
            </div>

            <div className="d-flex justify-content-center align-items-start flex-column">
                <div className="category-sidebar px-3" onClick={() => navigate('/admin')}>Dashboard</div>
                <div className="category-sidebar px-3" onClick={() => navigate('/admin/shops')}>Shops</div>
                <div className="category-sidebar px-3" onClick={() => navigate('/admin/sellers')}>Sellers</div>
                <div className="category-sidebar px-3" onClick={() => navigate('/admin/invoices')}>Invoices</div>
                <div className="category-sidebar px-3" onClick={() => navigate('/admin/comissions')}>Commissions</div>
                <div className="category-sidebar px-3" onClick={() => { setShowLogoutModal(true) }}>Logout</div>
            </div>

            {showLogoutModal && (
                <div className="modal-overlay text-of-app">
                    <div className="modal-content">
                        <h4 className="text-of-app">Are you sure you want to logout?</h4>
                        <div className="modal-buttons">
                            <button className="btn text-of-app btn-confirm" onClick={logout}>Yes</button>
                            <button className="btn text-of-app btn-cancel" onClick={() => setShowLogoutModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            </>
        )}

    </div>
    </>
  );
};

export default AdminSidebar;
