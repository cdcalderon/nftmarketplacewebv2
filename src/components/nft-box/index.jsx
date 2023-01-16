import { useNotification } from "web3uikit";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { useWeb3Contract, useMoralis } from "react-moralis";
import Image from "next/image";
import nftAbi from "../../../constants/BasicNft.json";
import nftMarketplaceAbi from "../../../constants/NftMarketplace.json";
import UpdateListingModal from "@components/modals/update-listing-modal";
import clsx from "clsx";

import Anchor from "@ui/anchor";
import CountdownTimer from "@ui/countdown/layout-01";
import ClientAvatar from "@ui/client-avatar";
import ShareDropdown from "@components/share-dropdown";
import ProductBid from "@components/product-bid";
import Button from "@ui/button";
import PlaceBidModal from "@components/modals/placebid-modal";

const truncateStr = (fullStr, strLen) => {
    if (fullStr.length <= strLen) return fullStr;

    const backChars = Math.floor(charsToShow / 2);
    const charsToShow = strLen - seperatorLength;
    const frontChars = Math.ceil(charsToShow / 2);
    const separator = "...";
    const seperatorLength = separator.length;
    return fullStr.slice(0, 5) + "..." + fullStr.slice(38, 42);
};

export default function NFTBox({
    overlay,
    title,
    slug,
    latestBid,
    likeCount,
    auction_date,
    image,
    bitCount,
    authors,
    placeBid,
    disableShareDropdown,
    price,
    nftAddress,
    tokenId,
    marketplaceAddress,
    seller,
}) {
    const [showBidModal, setShowBidModal] = useState(false);
    const handleBidModal = () => {
        setShowBidModal((prev) => !prev);
    };
    console.log("carlosTest", {
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
        nftAddress,
        tokenId,
        seller,
    });

    const [imageURI, setImageURI] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [tokenDescription, setTokenDescription] = useState("");
    const [tokenName, setTokenName] = useState("");
    const { isWeb3Enabled, account } = useMoralis();
    const dispatch = useNotification();
    const hideModal = () => setShowModal(false);

    const isOwnedByUser = seller === account || seller === undefined;
    const formattedSellerAddress = isOwnedByUser
        ? "you"
        : truncateStr(seller || "", 15);

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI();
        }
    }, [isWeb3Enabled]);

    const { runContractFunction: buyItem } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "buyItem",
        msgValue: price,
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
        },
    });

    const { runContractFunction: getTokenURI } = useWeb3Contract({
        abi: nftAbi,
        contractAddress: nftAddress,
        functionName: "tokenURI",
        params: {
            tokenId: tokenId,
        },
    });

    async function updateUI() {
        const tokenURI = await getTokenURI();
        console.log(`The TokenURI is ${tokenURI}`);
        if (tokenURI) {
            const requestURL = tokenURI.replace(
                "ipfs://",
                "https://ipfs.io/ipfs/"
            );
            const tokenURIResponse = await (await fetch(requestURL)).json();
            const imageURI = tokenURIResponse.image;
            const imageURIURL = imageURI.replace(
                "ipfs://",
                "https://ipfs.io/ipfs/"
            );
            setImageURI(imageURIURL);
            setTokenName(tokenURIResponse.name);
            setTokenDescription(tokenURIResponse.description);
        }
    }

    const handleCardClick = () => {
        isOwnedByUser
            ? setShowModal(true)
            : buyItem({
                  onError: (error) => console.log(error),
                  onSuccess: () => handleBuyItemSuccess(),
              });
    };

    const handleBuyItemSuccess = () => {
        dispatch({
            type: "success",
            message: "Item bought!",
            title: "Item Bought",
            position: "topR",
        });
    };

    return (
        <>
            <UpdateListingModal
                isVisible={showModal}
                tokenId={tokenId}
                marketplaceAddress={marketplaceAddress}
                nftAddress={nftAddress}
                onClose={hideModal}
            />
            {imageURI ? (
                <>
                    {" "}
                    <div
                        title={"marketplace address: " + marketplaceAddress}
                        className={clsx(
                            "product-style-one",
                            !overlay && "no-overlay",
                            placeBid && "with-placeBid"
                        )}
                    >
                        <div className="token-id">#{tokenId}</div>
                        <div className="card-thumbnail">
                            {image?.src && (
                                <Anchor path={`/product/${slug}`}>
                                    <Image
                                        loader={() => imageURI}
                                        src={imageURI}
                                        height="200"
                                        width="200"
                                    />
                                </Anchor>
                            )}
                            {auction_date && (
                                <CountdownTimer date={auction_date} />
                            )}
                            {placeBid && isOwnedByUser ? (
                                <Button
                                    className="update-nft-btn"
                                    onClick={handleCardClick}
                                    size="small"
                                >
                                    Update NFT
                                </Button>
                            ) : (
                                <Button
                                    className="buy-nft-btn"
                                    onClick={handleCardClick}
                                    size="small"
                                >
                                    Buy NFT
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
                            <span className="product-name">
                                {tokenName} - {tokenDescription}
                            </span>
                        </Anchor>
                        <div title={seller} className="italic text-sm">
                            Owned by {formattedSellerAddress}{" "}
                        </div>
                        {/* <span className="latest-bid">
                            Highest bid {latestBid}
                        </span> */}
                        <ProductBid
                            price={{
                                amount: ethers.utils.formatUnits(
                                    price,
                                    "ether"
                                ),
                                currency: "wETH",
                            }}
                            likeCount={likeCount}
                        />
                    </div>
                    <PlaceBidModal
                        show={showBidModal}
                        handleModal={handleBidModal}
                    />{" "}
                </>
            ) : (
                <div>Loading please wait...</div>
            )}
        </>
    );
}
