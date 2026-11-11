export default function ContactMap() {
    return (
      <div className="map-wrap d-flex border-top border-bottom wow fadeInUp">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.53152475297!2d-118.30405830000001!3d34.0558864!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2c79b6b66ce47%3A0xd174f23a98bf5368!2sW%209th%20St%2C%20Los%20Angeles%2C%20CA%2C%20USA!5e0!3m2!1sen!2sin!4v1773751034847!5m2!1sen!2sin"
          className="w-100"
          height="450"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Google Map"
        ></iframe>
      </div>
    );
  }