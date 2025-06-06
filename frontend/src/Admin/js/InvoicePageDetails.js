import '../css/InvoicePage.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { HomeIcon } from 'lucide-react';
import jsPDF from 'jspdf';

const InvoicePageDetails = () => {
    const navigate = useNavigate();
    const invoice_id = useParams().id;
    const [invoice, setInvoiceData] = useState({});

    const getInvoiceData = async () => {
        try {
            const response = await axios.get(`/api/admin/invoiceDataById/${invoice_id}`);
            if (response.status === 200) {
                setInvoiceData(response.data);
            } else {
                return "N/A";
            }
        } catch (error) {
            return "N/A";
        }
    };

    const resolveAmount = async () => {
        try {
            const response = await axios.post(`/api/admin/resolveInvoice`, {
                invoice_id: invoice.id,
            });
            if (response.status === 200) {
                alert("Invoice resolved successfully");
                getInvoiceData();
            } else {
                alert("Error resolving invoice");
            }
        } catch (error) {
            alert("Error resolving invoice");
        }
    };

    const getInvoiceStatus = (invoice) => {
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // Months are 0-indexed
        const currentYear = now.getFullYear();

        if (invoice.status === 0 && invoice.month === currentMonth && invoice.year === currentYear) {
            return "Ongoing";
        }
        return invoice.status === 0 ? "Pending" : "Paid";
    };

    const printInvoice = () => {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [360, 640], // Mobile screen size
        });

        doc.setFontSize(16);
        doc.text("Invoice Receipt", 20, 30);

        doc.setFontSize(12);
        doc.text(`Invoice ID: ${invoice.id || "N/A"}`, 20, 60);
        doc.text(`Month: ${new Date(invoice.year, invoice.month - 1).toLocaleString('default', { month: 'long' })} ${invoice.year || "N/A"}`, 20, 80);
        doc.text(`Seller ID: ${invoice.seller_id || "N/A"}`, 20, 100);
        doc.text(`Total Sales: Rs. ${invoice.total_sales ? invoice.total_sales.toFixed(2) : "0.00"}`, 20, 120);
        doc.text(`Admin Commission: Rs. ${invoice.admin_comission ? invoice.admin_comission.toFixed(2) : "0.00"}`, 20, 140);
        doc.text(`Amount Payable: Rs. ${invoice.total_sales && invoice.admin_comission ? (invoice.total_sales - invoice.admin_comission).toFixed(2) : "0.00"}`, 20, 160);
        doc.text(`Status: ${getInvoiceStatus(invoice)}`, 20, 180);

        doc.save(`Invoice_${invoice.id || "N/A"}.pdf`);
    };

    useEffect(() => {
        getInvoiceData();
    }, []);

    return (
        <>
            <div className="seller-data">
                <p className='back-btn text-of-app'><HomeIcon className="cursor-pointer"
                    onClick={() => navigate(`/admin/`)} style={{ width: "18px", color: "var(--text-of-app)", transform: "translateY(-1px)" }} />
                    &nbsp; /&nbsp; <span onClick={() => navigate(`/admin/invoices`)}  className="cursor-pointer" >Invoices</span>&nbsp; /&nbsp; <span className="cursor-pointer" >Invoice Details</span></p>

                <div className="d-flex justify-content-between align-items-center mt-5 mb-4">
                    <h3 className="text-of-app">Payments Overview</h3>
                </div>
                <div className="row p-3 my-3">
                        <SmallContainer _key="Invoice ID" _val={invoice.id} />
                        <SmallContainer _key="Month" _val={
                            new Date(invoice.year, invoice.month - 1).toLocaleString('default', { month: 'long' })
                            + " " + invoice.year} />
                        <SmallContainer _key="Seller Id" _val={invoice.seller_id} />
                        <SmallContainer _key="Total Sales" _val={invoice.total_sales} />
                        <SmallContainer _key="Admin Commission" _val={invoice.admin_comission} />
                        <SmallContainer _key="Amount Payable to Seller" _val={
                            invoice.total_sales && invoice.admin_comission
                                ? (invoice.total_sales - invoice.admin_comission).toFixed(2)
                                : "0.00"
                        } />
                        <SmallContainer _key="Status" _val={getInvoiceStatus(invoice)} />
                    </div>
                <div className="d-flex justify-content-center">
                    {getInvoiceStatus(invoice) === "Pending" ? (
                        <button className="btn btn-primary" onClick={() => resolveAmount()}>
                            Resolve Amount
                        </button>
                    ) : (
                        <>
                        <div className="d-flex justify-content-center align-items-center flex-column">

                        <p className="text-of-app">Amount is either already resolved or it is an ongoing month</p>
                        <button className="btn w-25 btn-success" disabled>
                            {getInvoiceStatus(invoice) === "Ongoing" ? "Ongoing" : "Resolved"}
                        </button>   
                        </div>
                        </>
                    )}
                </div>
                <div className="d-flex justify-content-center mt-4">
                    <button className="btn btn-secondary" onClick={printInvoice}>
                        Print Invoice
                    </button>
                </div>
            </div>
        </>
    );
};

const SmallContainer = ({ _key, _val, box = 3 }) => {
    return (
        <>
            <div className={`col-md-${box} offset-md-1`}>
                <div className='sec-text'>{_key}</div>
                <h4 className='pb-2 mb-3 text-of-app'>{_val}</h4>
            </div>
        </>
    )
}
export default InvoicePageDetails;
