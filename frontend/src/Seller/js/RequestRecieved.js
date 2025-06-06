import { useNavigate } from "react-router-dom";

const RequestRecieved = () => {
    const navigate = useNavigate();

    return (
        <div className="d-flex justify-content-center align-items-center flex-column w-100"
        style= {{height: "92vh"}}>
            <h1>Request Recieved</h1>
            <p>Your request has been received. We will get back to you shortly.</p>
            <button className="my-4 btn btn-success" onClick={() => navigate("/seller")}>
                Go to Dashboard
            </button>
        </div>
    );
}

export default RequestRecieved;