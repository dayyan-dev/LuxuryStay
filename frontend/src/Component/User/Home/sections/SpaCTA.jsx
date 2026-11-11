import { Link } from 'react-router-dom';

export default function SpaCTA() {
  return (
    <section className="call-to-action bg-primary section">
      <div className="container text-center">
        <h2 className="text-14 fw-600 text-white lh-sm wow fadeInUp mb-3">
          The Most Memorable <span className="text-black">Rest <br className="d-none d-md-block" />Time</span> Starts at The Mist
        </h2>
        <div className="wow fadeInUp" data-wow-delay=".2s">
          <Link className="btn btn-new btn-dark rounded-pill" to="/contact">
            <span className="btn-text"><span>Contact Us</span></span>
            <span className="btn-icon"><i className="fa-solid fa-arrow-right"></i></span>
          </Link>
        </div>
      </div>
    </section>
  );
}