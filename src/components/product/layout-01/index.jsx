import { useState } from "react";
import PropTypes from "prop-types";
import Image from "next/image";
import clsx from "clsx";
import Anchor from "@ui/anchor";
import CountdownTimer from "@ui/countdown/layout-01";
import ClientAvatar from "@ui/client-avatar";
import ShareDropdown from "@components/share-dropdown";
import ProductBid from "@components/product-bid";
import Button from "@ui/button";
import { ImageType } from "@utils/types";
import PlaceBidModal from "@components/modals/placebid-modal";

const Product = ({
    overlay,
    title,
    slug,
    latestBid,
    price,
    likeCount,
    auction_date,
    image,
    bitCount,
    authors,
    placeBid,
    disableShareDropdown,
    priceWei,
    nftAddress,
    tokenId,
    seller,
}) => {
    const [showBidModal, setShowBidModal] = useState(false);
    const handleBidModal = () => {
        setShowBidModal((prev) => !prev);
    };
    console.log("carlosP", {
        overlay,
        title,
        slug,
        latestBid,
        price,
        likeCount,
        auction_date,
        image,
        bitCount,
        authors,
        placeBid,
        disableShareDropdown,
        priceWei,
        nftAddress,
        tokenId,
        seller,
    });
    return (
        <>
            <div
                className={clsx(
                    "product-style-one",
                    !overlay && "no-overlay",
                    placeBid && "with-placeBid"
                )}
            >
                <div className="card-thumbnail">
                    {image?.src && (
                        <Anchor path={`/product/${slug}`}>
                            <Image
                                src={image.src}
                                alt={image?.alt || "NFT_portfolio"}
                                width={533}
                                height={533}
                            />
                        </Anchor>
                    )}
                    {auction_date && <CountdownTimer date={auction_date} />}
                    {placeBid && (
                        <Button onClick={handleBidModal} size="small">
                            Place Bid
                        </Button>
                    )}
                </div>
                <div className="product-share-wrapper">
                    <div className="profile-share">
                        {authors?.map((client) => (
                            <ClientAvatar
                                key={client.name}
                                slug={client.slug}
                                name={client.name}
                                image={client.image}
                            />
                        ))}
                        <Anchor
                            className="more-author-text"
                            path={`/product/${slug}`}
                        >
                            {bitCount}+ Place Bit.
                        </Anchor>
                    </div>
                    {!disableShareDropdown && <ShareDropdown />}
                </div>
                <Anchor path={`/product/${slug}`}>
                    <span className="product-name">{title}</span>
                </Anchor>
                <span className="latest-bid">Highest bid {latestBid}</span>
                <ProductBid price={price} likeCount={likeCount} />
            </div>
            <PlaceBidModal show={showBidModal} handleModal={handleBidModal} />
        </>
    );
};

Product.propTypes = {
    overlay: PropTypes.bool,
    title: PropTypes.string,
    slug: PropTypes.string.isRequired,
    latestBid: PropTypes,
    price: PropTypes.shape({
        amount: PropTypes.number.isRequired,
        currency: PropTypes.string.isRequired,
    }),
    likeCount: PropTypes.number,
    auction_date: PropTypes.string,
    image: ImageType,
    authors: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string,
            slug: PropTypes.string,
            image: ImageType,
        })
    ),
    bitCount: PropTypes.number,
    placeBid: PropTypes.bool,
    disableShareDropdown: PropTypes.bool,
    nftAddress: PropTypes.string,
    tokenId: PropTypes.string,
    seller: PropTypes.string,
    priceWei: PropTypes.string,
    marketplaceAddress: PropTypes.string,
};

Product.defaultProps = {
    overlay: false,
};

export default Product;
