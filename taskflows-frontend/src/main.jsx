import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import bgImage from "../../assets/images/bkg30.jpg";

const DashboardLayout = ({ children }) => {
  return (
    <div
      className="min-h-screen w-full flex flex-col relative"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <Header />
      <main className="grow pb-8">{children}</main>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
