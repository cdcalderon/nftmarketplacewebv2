import { ethers } from "ethers";
import { Input, useNotification } from "web3uikit";
import Modal from "react-bootstrap/Modal";
import { useState } from "react";
import { useWeb3Contract } from "react-moralis";
import Button from "@ui/button";
import { toast } from "react-toastify";
import { Row, Col, Spinner } from "react-bootstrap";
import nftMarketplaceAbi from "../../../../constants/NftMarketplace.json";

export default function UpdateListingModal({
    nftAddress,
    tokenId,
    isVisible,
    marketplaceAddress,
    onClose,
}) {
    const dispatch = useNotification();
    const [isUpdatingListing, setIsUpdatingListing] = useState(false);
    const notifyListingUpdated = () => toast("Listing updated");
    const [priceToUpdateListingWith, setPriceToUpdateListingWith] = useState(0);

    // change to async
    const handleUpdateListingSuccess = async (tx) => {
        await tx.wait(1);
        notifyListingUpdated();
        setIsUpdatingListing(false);
        // dispatch({
        //     type: "success",
        //     message: "listing updated",
        //     title: "Listing updated - please refresh (and move blocks)",
        //     position: "topR",
        // });
        onClose && onClose();
        setPriceToUpdateListingWith("0");
    };

    const { runContractFunction: updateListing } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "updateListing",
        params: {
            nftAddress,
            tokenId,
            newPrice: ethers.utils.parseEther(priceToUpdateListingWith || "0"),
        },
    });

    return (
        <Modal
            className="rn-popup-modal placebid-modal-wrapper"
            show={isVisible}
            onHide={onClose}
            centered
        >
            {isVisible && (
                <button type="button" className="btn-close" aria-label="Close">
                    <i className="feather-x" />
                </button>
            )}
            <Modal.Header>
                <h3 className="modal-title">Update NFT</h3>
            </Modal.Header>
            <Modal.Body>
                <p>You are about to update this NFT</p>
                <div className="placebid-form-box">
                    <h5 className="title">Update listing price in (ETH)</h5>
                    <div className="bid-content">
                        <div className="bid-content-top">
                            <div className="bid-content-left">
                                <input
                                    id="value"
                                    type="text"
                                    name="value"
                                    onChange={(event) => {
                                        setPriceToUpdateListingWith(
                                            event.target.value
                                        );
                                    }}
                                />
                                <span>wETH</span>
                            </div>
                        </div>

                        <div className="bid-content-mid">
                            <div className="bid-content-left">
                                {/* <span>Your Balance</span> */}
                                <span>Service fee</span>
                                {/* <span>Total bid amount</span> */}
                            </div>
                            <div className="bid-content-right">
                                {/* <span>9578 wETH</span> */}
                                <span>
                                    {priceToUpdateListingWith * 0.001} wETH
                                </span>
                                {/* <span>9588 wETH</span> */}
                            </div>
                        </div>
                    </div>
                    <div className="bit-continue-button">
                        {isUpdatingListing ? (
                            <Spinner animation="border" className="p-3 m-2" />
                        ) : (
                            <Button
                                size="medium"
                                fullwidth
                                onClick={(e) => {
                                    setIsUpdatingListing(true);
                                    e.stopPropagation();
                                    updateListing({
                                        onError: (error) => {
                                            console.log(error);
                                        },
                                        onSuccess: handleUpdateListingSuccess,
                                    });
                                }}
                            >
                                Proceed and update listing
                            </Button>
                        )}

                        <Button
                            color="primary-alta"
                            size="medium"
                            className="mt--10"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
}
