import React from "react";
import { useParams } from "react-router-dom";
import RoomDetails from "./sections/RoomDetails";


const RoomDetailsPage = () => {
  const { id } = useParams();
  const { room, loading } = RoomDetails(id);

  if (loading) return <div>Loading...</div>;

  return <RoomDetails room={room} />;
};

export default RoomDetailsPage;