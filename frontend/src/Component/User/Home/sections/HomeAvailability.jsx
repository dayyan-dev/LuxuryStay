import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomeAvailability() {
  const navigate = useNavigate();
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  const [rooms, setRooms] = useState('1');
  const [error, setError] = useState('');

  const handleCheckIn = (val) => {
    setCheckIn(val);
    if (!checkOut || checkOut <= val) {
      const next = new Date(val);
      next.setDate(next.getDate() + 1);
      setCheckOut(next.toISOString().split('T')[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      setError('Please select check-in and check-out dates.');
      return;
    }
    if (checkOut <= checkIn) {
      setError('Check-out must be after check-in.');
      return;
    }
    setError('');
    const query = new URLSearchParams({
      checkIn,
      checkOut,
      guests,
      rooms,
    });
    navigate(`/hotels?${query.toString()}`);
  };

  return (
    <section className="section">
      <div className="container">
        <div className="mx-auto text-center mb-5">
          <p className="wow fadeInUp">
            <span className="text-3 text-uppercase fw-600 rounded-pill border border-dark border-opacity-10 px-3 py-1">
              Plan Your Stay
            </span>
          </p>
          <h2 className="heading-font-family text-13 fw-600 lh-sm wow fadeInUp" data-wow-delay=".2s">
            Embark on <span className="text-primary">Your <br className="d-none d-md-block" />Bespoke</span> Experience
          </h2>
        </div>

        <form id="bookingHotels" onSubmit={handleSubmit}>
          <div className="intro-booking-form bg-light-1 rounded-pill p-4 p-lg-3 mt-4 wow fadeInUp" data-wow-delay=".4s">
            <div className="row gy-3 gx-lg-0 input-group align-items-center">
              <div className="col-md-6 col-lg">
                <div className="position-relative">
                  <input
                    id="hotelsCheckIn"
                    type="date"
                    className="form-control rounded-pill"
                    required
                    min={today}
                    value={checkIn}
                    onChange={(e) => handleCheckIn(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-6 col-lg">
                <div className="position-relative">
                  <input
                    id="hotelsCheckOut"
                    type="date"
                    className="form-control rounded-pill"
                    required
                    min={checkIn || today}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-6 col-lg">
                <select
                  className="form-select rounded-pill h-100"
                  id="adults"
                  required
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests</option>
                </select>
              </div>
              <div className="col-md-6 col-lg">
                <select
                  className="form-select rounded-pill h-100"
                  id="room"
                  required
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value)}
                >
                  <option value="1">1 Room</option>
                  <option value="2">2 Rooms</option>
                  <option value="3">3 Rooms</option>
                  <option value="4">4 Rooms</option>
                </select>
              </div>
              <div className="col-md-6 col-lg col-xl-auto d-grid">
                <button className="btn btn-primary text-nowrap rounded-pill" type="submit">
                  Check Now
                </button>
              </div>
            </div>
            {error && <p className="text-danger small text-center mt-3 mb-0">{error}</p>}
          </div>
        </form>
      </div>
    </section>
  );
}
