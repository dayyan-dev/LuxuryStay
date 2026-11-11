import { userAsset } from '../../../../utils/userAssets';

export default function FaqHero() {
  return (
    <section className="page-header page-header-text-light py-0 mb-0">
      <div className="hero-wrap py-5">
        <div className="hero-mask opacity-6 bg-black"></div>
        <div
          className="hero-bg hero-bg-scroll"
          style={{ backgroundImage: `url(${userAsset('images/slider/slide-2.jpg')})` }}
        ></div>
        <div className="hero-content py-2 py-lg-4 my-2 my-md-4">
          <div className="container text-center mt-5 pt-5 pb-2">
            <h1 className="text-17 mb-4 wow fadeInUp">Frequently Asked Questions</h1>
            <ul className="breadcrumb justify-content-center mb-0 wow fadeInUp" data-wow-delay=".2s">
              <li><a href="/">Home</a></li>
              <li className="active">Faqs</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}