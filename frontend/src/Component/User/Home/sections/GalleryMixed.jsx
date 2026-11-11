import { userAsset } from '../../../../utils/userAssets';

export default function GalleryMixed() {
  return (
    <section className="section">
      <div className="container">
        <div className="mx-auto text-center mb-5">
          <p className="wow fadeInUp">
            <span className="text-3 text-uppercase fw-600 rounded-pill border border-dark border-opacity-10 px-3 py-1">
              Image + Video
            </span>
          </p>
          <h2 className="heading-font-family text-13 fw-600 lh-sm wow fadeInUp" data-wow-delay=".2s">
            Image + Video <span className="text-primary">Gallery</span>
          </h2>
        </div>

        <div className="gallery">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="gallery-item rounded-5">
                <a className="glightbox" href={userAsset('images/rooms/room-1.jpg')}>
                  <img className="img-fluid d-block" src={userAsset('images/rooms/room-1.jpg')} alt="Mixed gallery image 1" />
                  <div className="overlay-details">
                    <span className="text-6"><i className="fa-solid fa-plus"></i></span>
                  </div>
                </a>
              </div>
            </div>

            <div className="col-md-4">
              <div className="gallery-item rounded-5">
                <a className="glightbox" href="https://youtu.be/s8vnc9l8sz4?si=x7x7MuHwsZMZL5hR">
                  <img className="img-fluid d-block" src={userAsset('images/rooms/room-single-4.jpg')} alt="Mixed gallery video" />
                  <div className="rounded-circle d-inline-flex position-absolute top-50 start-50 translate-middle">
                    <span className="playButton playButton-pulsing text-white bg-white bg-opacity-50"><i className="fa-solid fa-play"></i></span>
                  </div>
                </a>
              </div>
            </div>

            <div className="col-md-4">
              <div className="gallery-item rounded-5">
                <a className="glightbox" href={userAsset('images/rooms/room-2.jpg')}>
                  <img className="img-fluid d-block" src={userAsset('images/rooms/room-2.jpg')} alt="Mixed gallery image 2" />
                  <div className="overlay-details">
                    <span className="text-6"><i className="fa-solid fa-plus"></i></span>
                  </div>
                </a>
              </div>
            </div>

            <div className="col-md-4">
              <div className="gallery-item rounded-5">
                <a className="glightbox" href={userAsset('images/rooms/room-3.jpg')}>
                  <img className="img-fluid d-block" src={userAsset('images/rooms/room-3.jpg')} alt="Mixed gallery image 3" />
                  <div className="overlay-details">
                    <span className="text-6"><i className="fa-solid fa-plus"></i></span>
                  </div>
                </a>
              </div>
            </div>

            <div className="col-md-4">
              <div className="gallery-item rounded-5">
                <a className="glightbox" href={userAsset('images/rooms/room-4.jpg')}>
                  <img className="img-fluid d-block" src={userAsset('images/rooms/room-4.jpg')} alt="Mixed gallery image 4" />
                  <div className="overlay-details">
                    <span className="text-6"><i className="fa-solid fa-plus"></i></span>
                  </div>
                </a>
              </div>
            </div>

            <div className="col-md-4">
              <div className="gallery-item rounded-5">
                <a className="glightbox" href="https://youtu.be/s8vnc9l8sz4?si=x7x7MuHwsZMZL5hR">
                  <img className="img-fluid d-block" src={userAsset('images/rooms/room-1.jpg')} alt="Mixed gallery video 2" />
                  <div className="rounded-circle d-inline-flex position-absolute top-50 start-50 translate-middle">
                    <span className="playButton playButton-pulsing text-white bg-white bg-opacity-50"><i className="fa-solid fa-play"></i></span>
                  </div>
                </a>
              </div>
            </div>

            <div className="col-md-4">
              <div className="gallery-item rounded-5">
                <a className="glightbox" href="https://youtu.be/s8vnc9l8sz4?si=x7x7MuHwsZMZL5hR">
                  <img className="img-fluid d-block" src={userAsset('images/rooms/room-3.jpg')} alt="Mixed gallery video 3" />
                  <div className="rounded-circle d-inline-flex position-absolute top-50 start-50 translate-middle">
                    <span className="playButton playButton-pulsing text-white bg-white bg-opacity-50"><i className="fa-solid fa-play"></i></span>
                  </div>
                </a>
              </div>
            </div>

            <div className="col-md-4">
              <div className="gallery-item rounded-5">
                <a className="glightbox" href={userAsset('images/rooms/room-single-2.jpg')}>
                  <img className="img-fluid d-block" src={userAsset('images/rooms/room-single-2.jpg')} alt="Mixed gallery image 5" />
                  <div className="overlay-details">
                    <span className="text-6"><i className="fa-solid fa-plus"></i></span>
                  </div>
                </a>
              </div>
            </div>

            <div className="col-md-4">
              <div className="gallery-item rounded-5">
                <a className="glightbox" href={userAsset('images/rooms/room-5.jpg')}>
                  <img className="img-fluid d-block" src={userAsset('images/rooms/room-5.jpg')} alt="Mixed gallery image 6" />
                  <div className="overlay-details">
                    <span className="text-6"><i className="fa-solid fa-plus"></i></span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}