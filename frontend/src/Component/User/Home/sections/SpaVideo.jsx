import { userAsset } from '../../../../utils/userAssets';

export default function SpaVideo() {
  return (
    <section className="hero-wrap section">
      <div className="hero-mask opacity-7 bg-black"></div>
      <div
        className="hero-bg jarallax"
        style={{ backgroundImage: `url(${userAsset('images/spa/spa-hero.jpg')})` }}
      ></div>
      <div className="hero-content">
        <div className="container">
          <div className="row gy-4 my-5">
            <div className="col-md-9 text-center text-md-start wow fadeInLeft">
              <h2 className="text-16 fw-600 text-white lh-sm">
                Experience <br />the Art of Relaxation
              </h2>
              <p className="text-5 text-light mb-0">A peaceful ambiance designed to refresh your body and mind.</p>
            </div>
            <div className="col-md-3 align-content-center text-center wow fadeInRight" data-wow-delay="0.2s">
              <a className="glightbox rounded-circle d-inline-flex mb-4" href="https://www.youtube.com/embed/DjCFi8NRWvs">
                <span className="playButton playButton-pulsing text-white bg-white bg-opacity-50"><i className="fa-solid fa-play"></i></span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}