import { userAsset } from '../../../../utils/userAssets';

const imageItems = [
  { src: 'images/rooms/room-1.jpg', href: 'images/rooms/room-1.jpg', col: 'col-md-3' },
  { src: 'images/rooms/room-2.jpg', href: 'images/rooms/room-2.jpg', col: 'col-md-3' },
  { src: 'images/rooms/room-3.jpg', href: 'images/rooms/room-3.jpg', col: 'col-md-3' },
  { src: 'images/rooms/room-4.jpg', href: 'images/rooms/room-4.jpg', col: 'col-md-3' },

  { src: 'images/rooms/room-3-v.jpg', href: 'images/rooms/room-3-v.jpg', col: 'col-md-4' },
  { src: 'images/rooms/room-4-v.jpg', href: 'images/rooms/room-4-v.jpg', col: 'col-md-4' },
  { src: 'images/rooms/room-5-v.jpg', href: 'images/rooms/room-5-v.jpg', col: 'col-md-4' },

  { src: 'images/rooms/room-single-2.jpg', href: 'images/rooms/room-single-2.jpg', col: 'col-md-6' },
  { src: 'images/rooms/room-single-4.jpg', href: 'images/rooms/room-single-4.jpg', col: 'col-md-6' },
];

export default function GalleryImages() {
  return (
    <section className="section">
      <div className="container">
        <div className="mx-auto text-center mb-5">
          <p className="wow fadeInUp">
            <span className="text-3 text-uppercase fw-600 rounded-pill border border-dark border-opacity-10 px-3 py-1">
              Images
            </span>
          </p>
          <h2 className="heading-font-family text-13 fw-600 lh-sm wow fadeInUp" data-wow-delay=".2s">
            Image <span className="text-primary">Gallery</span>
          </h2>
        </div>

        <div className="gallery">
          <div className="row g-4">
            {imageItems.map((item, index) => (
              <div className={item.col} key={`${item.href}-${index}`}>
                <div className="gallery-item rounded-5">
                  <a className="glightbox" href={userAsset(item.href)}>
                    <img className="img-fluid d-block" src={userAsset(item.src)} alt={`Gallery ${index + 1}`} />
                    <div className="overlay-details">
                      <span className="text-6"><i className="fa-solid fa-plus"></i></span>
                    </div>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}