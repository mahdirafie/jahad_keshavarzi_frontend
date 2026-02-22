import React from "react";
import { useNavigate } from "react-router-dom";
import tractorImage from "../assets/images/tractor.png";

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-white">
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8 col-lg-6 text-center">
                        {/* Tractor image */}
                        <img
                            src={tractorImage}
                            alt="Tractor"
                            className="img-fluid mb-4"
                            style={{ maxWidth: "300px", width: "80%", opacity: 0.9 }}
                        />

                        {/* 404 in red and bold */}
                        <h1
                            className="display-1 fw-bold mb-3"
                            style={{ color: "#dc3545", fontSize: "clamp(4rem, 15vw, 8rem)" }}
                        >
                            ۴۰۴
                        </h1>

                        {/* Persian text in black */}
                        <p
                            className="lead mb-4"
                            style={{
                                color: "#212529",
                                fontSize: "clamp(1.2rem, 5vw, 1.8rem)",
                                fontWeight: "400",
                            }}
                        >
                            صفحه‌ای که دنبال آن بودید یافت نشد
                        </p>

                        {/* Optional: return home button (modern minimal style) */}
                        <button
                            onClick={() => navigate("/")}
                            className="btn btn-lg px-5 py-3"
                            style={{
                                borderRadius: "50px",
                                border: "1px solid black",
                                fontWeight: "500",
                                transition: "all 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = "#f8f9fa";
                                e.target.style.borderColor = "#6c757d";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = "transparent";
                                e.target.style.borderColor = "#6c757d";
                            }}
                        >
                            بازگشت به خانه
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}