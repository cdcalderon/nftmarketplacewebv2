import PropTypes from "prop-types";
import clsx from "clsx";
import Image from "next/image";
import LogoWidget from "@widgets/logo-widget";
import { ItemType } from "@utils/types";

// Demo data
import footerData from "../../../data/general/footer-01.json";

const Footer = ({ space, className, data }) => (
    <div
        className={clsx(
            "rn-footer-one bg-color--1",
            space === 1 && "rn-section-gap mt--100 mt_md--80 mt_sm--80",
            space === 2 && "rn-section-gap",
            space === 3 && "mt--100 mt_md--80 mt_sm--80",
            className
        )}
    >
        {data?.items && (
            <div className="footer-top">
                <div className="container">
                    <div className="row">
                        <ul className="nu-brand-area">
                            {data.items.map(({ id, image }) => (
                                <li key={id}>
                                    {image?.src && (
                                        <Image
                                            src={image.src}
                                            alt={
                                                image?.alt || "nuron-brand_nft"
                                            }
                                            layout="fill"
                                            objectFit="contain"
                                        />
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        )}

        <div className="container">
            <div className="row gx-5">
                <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                    <div className="widget-content-wrapper">
                        <LogoWidget data={footerData["logo-widget"]} />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

Footer.propTypes = {
    space: PropTypes.oneOf([1, 2, 3]),
    className: PropTypes.string,
    data: PropTypes.shape({
        items: PropTypes.arrayOf(ItemType),
    }),
};

Footer.defaultProps = {
    space: 1,
};

export default Footer;
