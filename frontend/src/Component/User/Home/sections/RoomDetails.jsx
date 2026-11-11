import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getSingleRoom } from "../../../../api/roomApi";
import HomeAvailability from "./HomeAvailability";
import {
  formatRoomTitle,
  getUploadUrl,
  isRoomBookingBlocked,
  getRoomStatusMeta,
} from "../../../../utils/userMedia";

const RoomDetails = () => {

  const { id } = useParams();

  const [room, setRoom] = useState(null);

  useEffect(() => {
    if (id) {
      fetchRoom();
    }
  }, [id]);

  const fetchRoom = async () => {
    try {
      const data = await getSingleRoom(id);
      setRoom(data.room || data);
    } catch (error) {
      console.log("Room fetch error:", error);
    }
  };

  const getImageUrl = (img) =>
    getUploadUrl(img, "https://via.placeholder.com/1200x700?text=No+Image");

  // LOADING
  if (!room) {
    return (
      <div className="text-center py-5">
        <h3>Loading...</h3>
      </div>
    );
  }

  return (
    <>
      {/* HERO */}
      <section className="page-header page-header-text-light py-0 mb-0">

        <div className="hero-wrap py-5">

          <div className="hero-mask opacity-6 bg-black"></div>

          {/* HERO IMAGE */}
          <div
            className="hero-bg hero-bg-scroll"
            style={{
              backgroundImage: `url(${getImageUrl(room.images?.[0])})`,
            }}
          ></div>

          <div className="hero-content py-2 py-lg-4 my-2 my-md-4">

            <div className="container text-center mt-5 pt-5 pb-2">

              <h1 className="text-17 mb-4">
                {formatRoomTitle(room)}
              </h1>

              <ul className="breadcrumb justify-content-center mb-0">

                <li>
                  <Link to="/home">Home</Link>
                </li>

                <li>
                  <Link to="/room">Rooms</Link>
                </li>

                <li className="active">
                  {formatRoomTitle(room)}
                </li>

              </ul>

            </div>
          </div>

        </div>
      </section>

      {/* CONTENT */}
      <div id="content" role="main">

        <section className="section">

          <div className="container">

            <div className="row gx-4 gy-5">

              {/* LEFT SIDE */}
              <div className="col-lg-8 col-xl-9">

                {/* IMAGE GALLERY */}
                <div className="row g-3 mb-4">

                  {room.images?.map((img, index) => (

                    <div
                      className="col-md-6"
                      key={index}
                    >

                      <img
                        className="img-fluid rounded-5 w-100"
                        src={getImageUrl(img)}
                        alt={room.title}
                        style={{
                          height: "300px",
                          objectFit: "cover",
                        }}
                      />

                    </div>

                  ))}

                </div>

                {/* TAG */}
                <p className="mb-2">

                  <span className="text-3 text-uppercase fw-600 rounded-pill border px-3 py-1">

                    {room.tag || "Luxury Room"}

                  </span>

                </p>

                {/* TITLE */}
                <h2 className="text-13 fw-600">
                  {formatRoomTitle(room)}
                </h2>

                {/* SUBTITLE */}
                <p className="text-body-secondary">
                  {room.subtitle || `Room ${room.roomNumber || ""}`.trim()}
                </p>

                {/* FEATURES */}
                <div className="row gy-2 gx-5 text-body-secondary mb-4">

                  <div className="col-md-auto d-flex align-items-center">

                    <i className="fa-solid fa-expand me-2 text-primary"></i>

                    {room.area}

                  </div>

                  <div className="col-md-auto d-flex align-items-center">

                    <i className="fa-solid fa-users me-2 text-primary"></i>

                    {room.persons}

                  </div>

                  <div className="col-md-auto d-flex align-items-center">

                    <i className="fa-solid fa-bed me-2 text-primary"></i>

                    {room.bedType}

                  </div>

                </div>

                {/* DESCRIPTION */}
                <p className="text-body-secondary">
                  {room.description}
                </p>

                {/* AMENITIES */}
                <h3 className="text-7 fw-600 mt-5 mb-3">
                  Room Amenities
                </h3>

                <div className="row g-3">

                  {room.amenities?.map((item, i) => (

                    <div
                      key={i}
                      className="col-md-6 d-flex align-items-center gap-2"
                    >

                      <i className="fa-solid fa-check text-success"></i>

                      {item}

                    </div>

                  ))}

                </div>

                {/* HOTEL RULES */}
                <h3 className="text-7 fw-600 mt-5 mb-3">
                  Hotel Rules
                </h3>

                <div className="row g-3">

                  <div className="col-md-4">

                    <p className="fw-600 mb-1">
                      Check-in
                    </p>

                    <div>
                      {room.checkIn || "From 2:00 PM"}
                    </div>

                  </div>

                  <div className="col-md-4">

                    <p className="fw-600 mb-1">
                      Check-out
                    </p>

                    <div>
                      {room.checkOut || "Until 12:00 PM"}
                    </div>

                  </div>

                  <div className="col-md-4">

                    <p className="fw-600 mb-1">
                      Pets
                    </p>

                    <div>
                      {room.pets || "Not allowed"}
                    </div>

                  </div>

                </div>

                {/* PRICE */}
                <div className="d-flex justify-content-between align-items-center mt-5">

                  <div className="text-9 fw-600">

                    Rs {Number(room.price || 0).toLocaleString()}

                    <span className="text-4 text-body-secondary">
                      {" "} / night
                    </span>

                  </div>

                  {isRoomBookingBlocked(room.status) ? (
                    <button className="btn btn-secondary rounded-pill px-4" disabled>
                      {getRoomStatusMeta(room.status)?.text || "Unavailable"}
                    </button>
                  ) : (
                    <Link
                      to={`/booking/${room._id || id}`}
                      className="btn btn-primary rounded-pill px-4 text-decoration-none"
                    >
                      Book Now
                    </Link>
                  )}

                </div>

              </div>

              {/* RIGHT SIDE */}
              <div className="col-lg-4 col-xl-3">

                <div className="bg-white rounded-5 p-4 mb-4 shadow-sm">

                  <h4 className="mb-3">
                    Other Rooms
                  </h4>

                  <ul className="list-unstyled">

                    {room.otherRooms?.map((r, i) => (

                      <li
                        key={i}
                        className="mb-2"
                      >
                        • {r}
                      </li>

                    ))}

                  </ul>

                </div>

              </div>

            </div>
          </div>

        </section>

        {/* AVAILABILITY */}
        <HomeAvailability />

      </div>
    </>
  );
};

export default RoomDetails;