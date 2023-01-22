import { useNotification } from "web3uikit";
import { useState, useEffect } from "react";
import { useWeb3Contract, useMoralis } from "react-moralis";
import { toast } from "react-toastify";
import { Row, Col, Spinner } from "react-bootstrap";
import Image from "next/image";
import Anchor from "@ui/anchor";
import ponchoCuteAbi from "../../../constants/PonchoCute.json";
import networkMapping from "../../../constants/networkMapping.json";

const truncateStr = (fullStr, strLen) => {
    if (fullStr.length <= strLen) return fullStr;

    const backChars = Math.floor(charsToShow / 2);
    const charsToShow = strLen - seperatorLength;
    const frontChars = Math.ceil(charsToShow / 2);
    const separator = "...";
    const seperatorLength = separator.length;
    return `${fullStr.slice(0, 5)}...${fullStr.slice(38, 42)}`;
};

export default function MintNft() {
    const [isMinting, setIsMinting] = useState(false);
    const [ownerOf, setOwnerOf] = useState([]);
    const notify = () => toast("Minted Successfully");
    const dispatch = useNotification();
    const { isWeb3Enabled, chainId, account } = useMoralis();
    const chainString = chainId ? parseInt(chainId).toString() : "31337";
    const ponchoCuteAddress = networkMapping[chainString].PonchoCute[0];
    const { runContractFunction } = useWeb3Contract();

    const { runContractFunction: mintNft } = useWeb3Contract({
        abi: ponchoCuteAbi,
        contractAddress: ponchoCuteAddress,
        functionName: "mint",
        params: {
            _mintAmount: 1,
        },
    });

    const { runContractFunction: walletOfOwner } = useWeb3Contract({
        abi: ponchoCuteAbi,
        contractAddress: ponchoCuteAddress,
        functionName: "walletOfOwner",
        params: {
            _account: account,
        },
    });

    const handleMint = async () => {
        if (ownerOf.length > 0) {
            window.alert("You've already minted!");
            return;
        }

        setIsMinting(true);

        runContractFunction;
        await mintNft({
            onError: (error) => console.log(error),
            onSuccess: handleMintingSuccess,
        });
    };

    async function handleMintingSuccess(tx) {
        await tx.wait(1);
        const walletOfOwnerOptions = {
            abi: ponchoCuteAbi,
            contractAddress: ponchoCuteAddress,
            functionName: "walletOfOwner",
            params: {
                _owner: account,
            },
        };

        notify();
        setIsMinting(false);

        await runContractFunction({
            params: walletOfOwnerOptions,
            onSuccess: (ownerOf) => setOwnerOf(ownerOf),
            onError: (error) => {
                console.log("Error ", error);
            },
        });

        // dispatch({
        //     type: "success",
        //     message: "NFT successfully minted!",
        //     title: "NFT Minted",
        //     position: "topR",
        // });
    }

    const loadWeb3 = async () => {
        const walletOfOwnerOptions = {
            abi: ponchoCuteAbi,
            contractAddress: ponchoCuteAddress,
            functionName: "walletOfOwner",
            params: {
                _owner: account,
            },
        };
        if (account) {
            await runContractFunction({
                params: walletOfOwnerOptions,
                onSuccess: (ownerOf) => setOwnerOf(ownerOf),
                onError: (error) => {
                    console.log("Error ", error);
                },
            });
        } else {
            setOwnerOf([]);
        }
    };

    useEffect(() => {
        console.log("account loaded ", account);
        loadWeb3();
    }, [account]);

    return (
        <>
            <div className="cnt-messages header">
                <h1>Poncho Cute</h1>
                <h2>2,000 Poncho Cute NFTs available</h2>
                <h3>Free minting on Goerli testnet only</h3>
            </div>
            <Row className="header my-3 p-3 mb-0 pb-0">
                <Col xs={12} md={12} lg={8} xxl={8} />
                <Col className="flex social-icons">
                    {networkMapping[chainString].openseaURL && (
                        <Anchor
                            className="logo-dark"
                            path={`${networkMapping[chainString].openseaURL}/collection/${networkMapping[chainString].projectName}`}
                        >
                            <Image
                                src="/images/opensea.png"
                                alt="opensea"
                                width={40}
                                height={40}
                            />
                        </Anchor>
                    )}
                </Col>
            </Row>

            <div className="mint-nft-actions">
                {isMinting ? (
                    <Spinner animation="border" className="p-3 m-2" />
                ) : (
                    <button className="mint-btn" onClick={handleMint}>
                        Mint
                    </button>
                )}

                {ownerOf.length > 0 && (
                    <p>
                        <small>
                            View your NFT on
                            <a
                                href={`${networkMapping[chainString].openseaURL}/assets/${ponchoCuteAddress}/${ownerOf[0]}`}
                                target="_blank"
                                style={{
                                    display: "inline-block",
                                    marginLeft: "3px",
                                }}
                                rel="noreferrer"
                            >
                                OpenSea
                            </a>
                        </small>
                    </p>
                )}
            </div>
        </>
    );
}
