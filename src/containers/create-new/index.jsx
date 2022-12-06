/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { useForm } from "react-hook-form";
import Button from "@ui/button";
import ProductModal from "@components/modals/product-modal";
import ErrorText from "@ui/error-text";
import { toast } from "react-toastify";
import { ethers } from "ethers";
import { useNotification } from "web3uikit";
import { useMoralis, useWeb3Contract } from "react-moralis";
import networkMapping from "../../../constants/networkMapping.json";
import nftAbi from "../../../constants/BasicNft.json";
import nftMarketplaceAbi from "../../../constants/NftMarketplace.json";

const CreateNewArea = ({ className, space }) => {
    const [showProductModal, setShowProductModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState();
    const [hasImageError, setHasImageError] = useState(false);
    const [previewData, setPreviewData] = useState({});

    const { chainId, account, isWeb3Enabled } = useMoralis();
    const chainString = chainId ? parseInt(chainId).toString() : "31337";
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0];
    const dispatch = useNotification();
    const [proceeds, setProceeds] = useState("0");

    const { runContractFunction } = useWeb3Contract();

    useEffect(() => {
        if (isWeb3Enabled) {
            setupUI();
        }
    }, [proceeds, account, isWeb3Enabled, chainId]);

    async function approveAndList(data) {
        console.log("Approving...");
        const nftAddress = data.data[0].inputResult;
        const tokenId = data.data[1].inputResult;
        const price = ethers.utils
            .parseUnits(data.data[2].inputResult, "ether")
            .toString();

        const approveOptions = {
            abi: nftAbi,
            contractAddress: nftAddress,
            functionName: "approve",
            params: {
                to: marketplaceAddress,
                tokenId,
            },
        };

        await runContractFunction({
            params: approveOptions,
            onSuccess: () => handleApproveSuccess(nftAddress, tokenId, price),
            onError: (error) => {
                console.log(error);
            },
        });
    }

    const onSubmit = async (data, e) => {
        const { target } = e;

        console.log("Approving...", data, e);

        const nftAddress = data.nftaddress;
        const tokenId = data.tokenid;
        const price = ethers.utils.parseUnits(data.price, "ether").toString();

        console.log("cccc", nftAddress, tokenId, price);
        const approveOptions = {
            abi: nftAbi,
            contractAddress: nftAddress,
            functionName: "approve",
            params: {
                to: marketplaceAddress,
                tokenId,
            },
        };

        await runContractFunction({
            params: approveOptions,
            onSuccess: () => handleApproveSuccess(nftAddress, tokenId, price),
            onError: (error) => {
                console.log(error);
            },
        });
    };

    async function handleApproveSuccess(nftAddress, tokenId, price) {
        console.log("Ok! Now time to list");
        const listOptions = {
            abi: nftMarketplaceAbi,
            contractAddress: marketplaceAddress,
            functionName: "listItem",
            params: {
                nftAddress,
                tokenId,
                price,
            },
        };

        await runContractFunction({
            params: listOptions,
            onSuccess: handleListSuccess,
            onError: (error) => console.log(error),
        });
    }

    async function handleListSuccess(tx) {
        await tx.wait(1);
        console.log("ListSuccess");
        reset();
        dispatch({
            type: "success",
            message: "NFT listing",
            title: "NFT listed",
            position: "topR",
        });
    }

    async function setupUI() {
        const returnedProceeds = await runContractFunction({
            params: {
                abi: nftMarketplaceAbi,
                contractAddress: marketplaceAddress,
                functionName: "getProceeds",
                params: {
                    seller: account,
                },
            },
            onError: (error) => console.log(error),
        });
        if (returnedProceeds) {
            setProceeds(returnedProceeds.toString());
        }
    }

    const handleWithdrawSuccess = async (tx) => {
        await tx.wait(1);
        console.log("WithdrawSuccess");
        dispatch({
            type: "success",
            message: "Withdrawing proceeds",
            position: "topR",
        });
    };

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        mode: "onChange",
    });

    const notify = () => toast("Your product has submitted");
    const handleProductModal = () => {
        setShowProductModal(false);
    };

    // This function will be triggered when the file field change
    const imageChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedImage(e.target.files[0]);
        }
    };

    return (
        <>
            <div
                className={clsx(
                    "create-area",
                    space === 1 && "rn-section-gapTop",
                    className
                )}
            >
                <form action="#" onSubmit={handleSubmit(onSubmit)}>
                    <div className="container">
                        <div className="row g-5">
                            <div className="col-lg-3 offset-1 ml_md--0 ml_sm--0">
                                <div className="upload-area">
                                    <div className="upload-formate mb--30">
                                        <h6 className="title">List NFT</h6>
                                        <p className="formate">Fill form:</p>
                                    </div>

                                    {hasImageError && !selectedImage && (
                                        <ErrorText>Image is required</ErrorText>
                                    )}
                                </div>

                                <div className="mt--100 mt_sm--30 mt_md--30 d-none d-lg-block">
                                    <h5> Note: </h5>
                                    <span>
                                        {" "}
                                        Service fee : <strong>2.3%</strong>{" "}
                                    </span>{" "}
                                    <br />
                                    <span>
                                        {" "}
                                        You will receive : {/* Pending... */}
                                        {/* <strong>25.00 ETH $50,000</strong> */}
                                    </span>
                                </div>
                            </div>
                            <div className="col-lg-7">
                                <div className="form-wrapper-one">
                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="input-box pb--20">
                                                <label
                                                    htmlFor="nftaddress"
                                                    className="form-label"
                                                >
                                                    NFT Address
                                                </label>
                                                <input
                                                    id="nftaddress"
                                                    placeholder="e. g. `0x483f2961664f66f09a...`"
                                                    {...register("nftaddress", {
                                                        required:
                                                            "NFT Address is required",
                                                    })}
                                                />
                                                {errors.nftaddress && (
                                                    <ErrorText>
                                                        {
                                                            errors.nftaddress
                                                                ?.message
                                                        }
                                                    </ErrorText>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-md-4">
                                            <div className="input-box pb--20">
                                                <label
                                                    htmlFor="tokenid"
                                                    className="form-label"
                                                >
                                                    Token ID
                                                </label>
                                                <input
                                                    id="tokenid"
                                                    placeholder="e. g. `1234`"
                                                    {...register("tokenid", {
                                                        required:
                                                            "Token ID is required",
                                                    })}
                                                />
                                                {errors.tokenid && (
                                                    <ErrorText>
                                                        {
                                                            errors.tokenid
                                                                ?.message
                                                        }
                                                    </ErrorText>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-md-12">
                                            <div className="input-box pb--20">
                                                <label
                                                    htmlFor="price"
                                                    className="form-label"
                                                >
                                                    Price (in ETH)
                                                </label>
                                                <input
                                                    id="price"
                                                    placeholder="e. g. `0.000001`"
                                                    {...register("price", {
                                                        required:
                                                            "Price is required",
                                                    })}
                                                />
                                                {errors.price && (
                                                    <ErrorText>
                                                        {errors.price?.message}
                                                    </ErrorText>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-md-12 col-xl-8 mt_lg--15 mt_md--15 mt_sm--15">
                                            <div className="input-box">
                                                <Button type="submit" fullwidth>
                                                    Submit Item
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt--100 mt_sm--30 mt_md--30 d-block d-lg-none">
                                <h5> Note: </h5>
                                <span>
                                    {" "}
                                    Service fee : <strong>2.5%</strong>{" "}
                                </span>{" "}
                                <br />
                                <span>
                                    {" "}
                                    You will receive :{" "}
                                    <strong>25.00 ETH $50,000</strong>
                                </span>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            {showProductModal && (
                <ProductModal
                    show={showProductModal}
                    handleModal={handleProductModal}
                    data={previewData}
                />
            )}
        </>
    );
};

CreateNewArea.propTypes = {
    className: PropTypes.string,
    space: PropTypes.oneOf([1]),
};

CreateNewArea.defaultProps = {
    space: 1,
};

export default CreateNewArea;
