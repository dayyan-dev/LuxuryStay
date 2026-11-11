import { useEffect, useState } from "react";
import axios from "axios";

const useRoomDetails = (id) => {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await axios.get(`/api/roomsdetails/${id}`);
        setRoom(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRoom();
  }, [id]);

  return { room, loading };
};

export default useRoomDetails;