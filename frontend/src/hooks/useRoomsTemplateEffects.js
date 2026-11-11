import { useState, useEffect } from 'react';

const useRoomsTemplateEffects = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // 1. Template Effect: Page load hote hi top par scroll karega
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // 2. Data Fetching Effect: Rooms ka data load karne ke liye
        const fetchRoomsData = async () => {
            try {
                setLoading(true);
                
                // AGAR BACKEND API HAI TOH YAHAN FETCH KAREIN:
                // const response = await fetch('http://localhost:5000/api/rooms');
                // const data = await response.json();
                // setRooms(data);

                // FILHAAL KE LIYE DUMMY DATA (Aap ise apne mutabiq badal sakte hain):
                setTimeout(() => {
                    const dummyRooms = [
                        { id: 1, name: "Deluxe Suite", price: "$150", rating: 4.8 },
                        { id: 2, name: "Luxury Room", price: "$250", rating: 5.0 },
                        { id: 3, name: "Standard Room", price: "$90", rating: 4.2 },
                    ];
                    setRooms(dummyRooms);
                    setLoading(false);
                }, 1000); // 1 second ka delay simulate kiya hai

            } catch (err) {
                setError("Rooms data load karne mein koi masla hua h!");
                setLoading(false);
            }
        };

        fetchRoomsData();
    }, []);

    // Jo data components ko chahiye wo yahan se return hoga
    return { rooms, loading, error };
};

export default useRoomsTemplateEffects;