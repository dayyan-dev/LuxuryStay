const bookingTemplate = (data) => {

    return `
    
    <div style="font-family: Arial; background:#f4f4f4; padding:40px;">
  
      <table width="100%" style="max-width:700px; margin:auto; background:white; border-radius:12px; overflow:hidden;">
  
        <tr>
          <td style="
            background: linear-gradient(90deg,#4f46e5,#7c3aed);
            color:white;
            padding:30px;
            text-align:center;
          ">
            <h1>Luxury Hotel</h1>
            <p>Your Booking is Confirmed</p>
          </td>
        </tr>
  
        <tr>
          <td style="padding:30px;">
  
            <h2>Hello ${data.name}</h2>
  
            <p>Your booking has been confirmed successfully.</p>
  
            <table width="100%" cellpadding="10" style="border-collapse: collapse;">
  
              <tr>
                <td><strong>Room Number</strong></td>
                <td>${data.roomNo}</td>
              </tr>
  
              <tr>
                <td><strong>Check-In</strong></td>
                <td>${data.checkInDate}</td>
              </tr>
  
              <tr>
                <td><strong>Check-Out</strong></td>
                <td>${data.checkOutDate}</td>
              </tr>
  
              <tr>
                <td><strong>Total Amount</strong></td>
                <td>Rs. ${data.totalPrice}</td>
              </tr>
  
            </table>
  
            <div style="margin-top:30px; text-align:center;">
              <a href="#"
                style="
                  background:#4f46e5;
                  color:white;
                  padding:14px 24px;
                  text-decoration:none;
                  border-radius:8px;
                ">
                View Booking
              </a>
            </div>
  
          </td>
        </tr>
  
        <tr>
          <td style="
            background:#111827;
            color:white;
            text-align:center;
            padding:20px;
          ">
            <p>© 2026 Luxury Hotel</p>
          </td>
        </tr>
  
      </table>
  
    </div>
    
    `;
  };
  
  module.exports = bookingTemplate;