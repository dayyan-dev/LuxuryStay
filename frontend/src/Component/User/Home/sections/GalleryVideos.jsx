import { userAsset } from '../../../../utils/userAssets';

const videoItems = [
  { src: 'images/rooms/room-2.jpg' },
  { src: 'images/rooms/room-1.jpg' },
  { src: 'images/rooms/room-3.jpg' },
  { src: 'images/rooms/room-single-2.jpg' },
  { src: 'images/rooms/room-single-3.jpg' },
];

export default function GalleryVideos() {
  return (
    <section className="section bg-light-1">
      <div className="container">
        <div className="mx-auto text-center mb-5">
          <p className="wow fadeInUp">
            <span className="text-3 text-uppercase fw-600 rounded-pill border border-dark border-opacity-10 px-3 py-1">
              Video
            </span>
          </p>
          <h2 className="heading-font-family text-13 fw-600 lh-sm wow fadeInUp" data-wow-delay=".2s">
            Video <span className="text-primary">Gallery</span>
          </h2>
        </div>

        <div className="gallery">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="gallery-item rounded-5">
                <a className="glightbox" href="https://youtu.be/s8vnc9l8sz4?si=x7x7MuHwsZMZL5hR">
                  <img className="img-fluid d-block" src={userAsset(videoItems[0].src)} alt="Gallery video 1" />
                  <div className="rounded-circle d-inline-flex position-absolute top-50 start-50 translate-middle">
                    <span className="playButton playButton-pulsing text-white bg-white bg-opacity-50"><i className="fa-solid fa-play"></i></span>
                  </div>
                </a>
              </div>
            </div>

            <div className="col-md-4">
              <div className="gallery-item rounded-5">
                <a className="glightbox" href="https://youtu.be/s8vnc9l8sz4?si=x7x7MuHwsZMZL5hR">
                  <img className="img-fluid d-block" src={userAsset(videoItems[1].src)} alt="Gallery video 2" />
                  <div className="rounded-circle d-inline-flex position-absolute top-50 start-50 translate-middle">
                    <span className="playButton playButton-pulsing text-white bg-white bg-opacity-50"><i className="fa-solid fa-play"></i></span>
                  </div>
                </a>
              </div>
            </div>

            <div className="col-md-4">
              <div className="gallery-item rounded-5">
                <a className="glightbox" href="https://youtu.be/s8vnc9l8sz4?si=x7x7MuHwsZMZL5hR">
                  <img className="img-fluid d-block" src={userAsset(videoItems[2].src)} alt="Gallery video 3" />
                  <div className="rounded-circle d-inline-flex position-absolute top-50 start-50 translate-middle">
                    <span className="playButton playButton-pulsing text-white bg-white bg-opacity-50"><i className="fa-solid fa-play"></i></span>
                  </div>
                </a>
              </div>
            </div>

            <div className="col-md-6">
              <div className="gallery-item rounded-5">
                <a className="glightbox" href="https://youtu.be/s8vnc9l8sz4?si=x7x7MuHwsZMZL5hR">
                  <img className="img-fluid d-block" src={userAsset(videoItems[3].src)} alt="Gallery video 4" />
                  <div className="rounded-circle d-inline-flex position-absolute top-50 start-50 translate-middle">
                    <span className="playButton playButton-pulsing text-white bg-white bg-opacity-50"><i className="fa-solid fa-play"></i></span>
                  </div>
                </a>
              </div>
            </div>

            <div className="col-md-6">
              <div className="gallery-item rounded-5">
                <a className="glightbox" href="https://youtu.be/s8vnc9l8sz4?si=x7x7MuHwsZMZL5hR">
                  <img className="img-fluid d-block" src={userAsset(videoItems[4].src)} alt="Gallery video 5" />
                  <div className="rounded-circle d-inline-flex position-absolute top-50 start-50 translate-middle">
                    <span className="playButton playButton-pulsing text-white bg-white bg-opacity-50"><i className="fa-solid fa-play"></i></span>
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