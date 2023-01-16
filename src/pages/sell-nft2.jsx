import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header/header-01";
import Footer from "@layout/footer/footer-01";
import Breadcrumb from "@components/breadcrumb";
import { ethers } from "ethers";
import { Form, useNotification, Button } from "web3uikit";
import { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import networkMapping from "../../constants/networkMapping.json";
import nftAbi from "../../constants/BasicNft.json";
import nftMarketplaceAbi from "../../constants/NftMarketplace.json";

export async function getStaticProps() {
    return { props: { className: "template-color-1" } };
}

const SellNft = () => {
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
                tokenId: tokenId,
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

    async function handleApproveSuccess(nftAddress, tokenId, price) {
        console.log("Ok! Now time to list");
        const listOptions = {
            abi: nftMarketplaceAbi,
            contractAddress: marketplaceAddress,
            functionName: "listItem",
            params: {
                nftAddress: nftAddress,
                tokenId: tokenId,
                price: price,
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
    return (
        <Wrapper>
            <SEO pageTitle="Sign Up" />
            <Header />
            <main id="main-content">
                <Breadcrumb pageTitle="Sign Up" currentPage="Sign Up" />
                <div>
                    <Form
                        onSubmit={approveAndList}
                        data={[
                            {
                                name: "NFT Address",
                                type: "text",
                                inputWidth: "50%",
                                value: "",
                                key: "nftAddress",
                            },
                            {
                                name: "Token ID",
                                type: "number",
                                value: "",
                                key: "tokenId",
                            },
                            {
                                name: "Price (in ETH)",
                                type: "number",
                                value: "",
                                key: "price",
                            },
                        ]}
                        title="Sell your NFT!"
                        id="Main Form"
                    />
                    <div>Withdraw {proceeds} proceeds</div>
                    {proceeds != "0" ? (
                        <Button
                            onClick={() => {
                                runContractFunction({
                                    params: {
                                        abi: nftMarketplaceAbi,
                                        contractAddress: marketplaceAddress,
                                        functionName: "withdrawProceeds",
                                        params: {},
                                    },
                                    onError: (error) => console.log(error),
                                    onSuccess: handleWithdrawSuccess,
                                });
                            }}
                            text="Withdraw"
                            type="button"
                        />
                    ) : (
                        <div>No proceeds detected</div>
                    )}
                </div>
            </main>
            <Footer />
        </Wrapper>
    );
};

export default SellNft;
