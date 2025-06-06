import '../css/InvoicePage.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { HomeIcon } from 'lucide-react';

const InvoicePage = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [filteredInvoices, setFilteredInvoices] = useState([]);
    const [sellerNames, setSellerNames] = useState({});
    const [filterStatus, setFilterStatus] = useState("Ongoing"); // Default to "All"
    const [sortConfig, setSortConfig] = useState({ key: "month", direction: "desc" });

    const getInvoiceData = async () => {
        try {
            const response = await axios.get('/api/admin/invoice/all');
            if (response.status === 200) {
                const invoiceData = response.data;
                setInvoices(invoiceData);

                // Fetch seller names for all invoices
                const sellerIds = [...new Set(invoiceData.map(invoice => invoice.seller_id))];
                const sellerNamePromises = sellerIds.map(async (sellerId) => {
                    const sellerName = await getSellerName(sellerId);
                    return { sellerId, sellerName };
                });

                const sellerNameResults = await Promise.all(sellerNamePromises);
                const sellerNameMap = sellerNameResults.reduce((acc, { sellerId, sellerName }) => {
                    acc[sellerId] = sellerName;
                    return acc;
                }, {});

                setSellerNames(sellerNameMap);

                // Filter and sort invoices
                filterAndSortInvoices(invoiceData, filterStatus, sortConfig);
            } else {
                console.error('Error fetching invoice data:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching invoice data:', error);
        }
    };

    const getSellerName = async (sellerId) => {
        try {
            const response = await axios.get(`/api/seller/complete/${sellerId}`);
            if (response.status === 200) {
                return response.data?.name || "N/A";
            } else {
                console.error(`Error fetching seller name for seller_id ${sellerId}:`, response.statusText);
                return "N/A";
            }
        } catch (error) {
            console.error(`Error fetching seller name for seller_id ${sellerId}:`, error);
            return "N/A";
        }
    };

    const getMonthName = (monthNumber) => {
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        return months[monthNumber - 1] || "Invalid Month";
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

    const getStatusColor = (status) => {
        switch (status) {
            case "Paid":
                return "green";
            case "Ongoing":
                return "orange";
            case "Pending":
                return "red";
            default:
                return "black";
        }
    };
    const getStatusFrontColor = (status) => {
        switch (status) {
            case "Paid":
                return "white";
            case "Ongoing":
                return "black";
            case "Pending":
                return "white";
            default:
                return "white";
        }
    };

    const filterAndSortInvoices = (invoices, statusFilter, sortConfig) => {
        let filtered = invoices.filter(invoice => {
            const status = getInvoiceStatus(invoice);
            return statusFilter === "All" || status === statusFilter;
        });

        if (sortConfig.key) {
            filtered = filtered.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
                return 0;
            });
        }

        setFilteredInvoices(filtered);
    };

    const handleFilterChange = (e) => {
        const status = e.target.value;
        setFilterStatus(status);
        filterAndSortInvoices(invoices, status, sortConfig);
    };

    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        const newSortConfig = { key, direction };
        setSortConfig(newSortConfig);
        filterAndSortInvoices(invoices, filterStatus, newSortConfig);
    };

    const getSortIcon = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === "asc" ? " ▲" : " ▼";
        }
        return "";
    };

    useEffect(() => {
        getInvoiceData();
    }, []);

    return (
        <>
            <div className="seller-data">
                <p className='back-btn text-of-app'><HomeIcon className="cursor-pointer"
                    onClick={() => navigate(`/admin/`)} style={{ width: "18px", color: "var(--text-of-app)", transform: "translateY(-1px)" }} />
                    &nbsp; /&nbsp; <span className="cursor-pointer" >Invoices</span></p>

                <div className="d-flex justify-content-center align-items-center mb-2">
                    <h3 className="text-of-app">Payments Overview</h3>
                </div>
                <div className="d-flex justify-content-end align-items-center  mb-4">
                    <select
                        className="form-control w-25"
                        value={filterStatus}
                        onChange={handleFilterChange}
                    >
                        <option value="Pending">Pending</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Paid">Paid</option>
                        <option value="All">All</option>
                    </select>
                </div>

                <div className="d-flex justify-content-center">
                    <p className='text-secondary'>Currently showing {filterStatus} invoices</p>
                </div>

                {filteredInvoices && filteredInvoices.length === 0 ? (
                    <p className="text-of-app text-center">No invoices to show.</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-striped table-bordered bg-white">
                            <thead className="table-dark">
                                <tr>
                                    <th className="cursor-pointer" onClick={() => handleSort("month")}>
                                        Month {getSortIcon("month")}
                                    </th>
                                    <th className="cursor-pointer" onClick={() => handleSort("seller_id")}>
                                        Seller Id {getSortIcon("seller_id")}
                                    </th>
                                    <th className="cursor-pointer" onClick={() => handleSort("sellerName")}>
                                        Seller Name {getSortIcon("sellerName")}
                                    </th>
                                    <th className="cursor-pointer" onClick={() => handleSort("total_sales")}>
                                        Total Sales {getSortIcon("total_sales")}
                                    </th>
                                    <th className="cursor-pointer" onClick={() => handleSort("admin_comission")}>
                                        Admin Comission Deducted {getSortIcon("admin_comission")}
                                    </th>
                                    <th className="cursor-pointer" onClick={() => handleSort("amount_payable")}>
                                        Amount Payable to Seller {getSortIcon("amount_payable")}
                                    </th>
                                    <th className="cursor-pointer" onClick={() => handleSort("status")}>
                                        Status {getSortIcon("status")}
                                    </th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(filteredInvoices) && filteredInvoices.map((invoice, index) => {
                                    const status = getInvoiceStatus(invoice);
                                    return (
                                        <tr key={index}>
                                            <td>{getMonthName(invoice?.month)} {invoice?.year}</td>
                                            <td>{invoice?.seller_id}</td>
                                            <td>{sellerNames[invoice.seller_id] || "Loading..."}</td>
                                            <td>Rs. {invoice?.total_sales ? invoice.total_sales.toFixed(2) : '0.00'}</td>
                                            <td>Rs. {invoice?.admin_comission ? invoice.admin_comission.toFixed(2) : '0.00'}</td>
                                            <td>Rs. {invoice?.total_sales && invoice?.admin_comission ? (invoice?.total_sales - invoice?.admin_comission).toFixed(2) : "0.00"}</td>
                                            <td style={{ backgroundColor: getStatusColor(status), color: getStatusFrontColor(status) }} className="text-center">
                                                {status}
                                            </td>
                                            <td className="text-center">
                                                <button className="btn btn-primary" onClick={() => navigate(`/admin/invoices/${invoice.id}`)}>View</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
};

export default InvoicePage;
