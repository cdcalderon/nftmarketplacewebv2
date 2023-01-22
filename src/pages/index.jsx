import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header/header-01";
import Footer from "@layout/footer/footer-01";
import ExploreProductArea from "@containers/explore-product/layout-01";
import { normalizedData } from "@utils/methods";
import Breadcrumb from "@components/breadcrumb";

import { useMoralis } from "react-moralis";
import { useQuery } from "@apollo/client";
import GET_ACTIVE_ITEMS from "../../constants/subgraphQueries";
import networkMapping from "../../constants/networkMapping.json";

// Demo Data
import homepageData from "../data/homepages/home-01.json";
import productData from "../data/products.json";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

export async function getStaticProps() {
    return { props: { className: "template-color-1" } };
}

const Home = () => {
    const [listedNfts, setListedNfts] = useState();
    const router = useRouter();
    const {
        query: { shouldRefresh },
    } = router;

    console.log();
    const { isWeb3Enabled, chainId } = useMoralis();
    const chainString = chainId ? parseInt(chainId).toString() : "31337";
    console.log(chainString);
    console.log("chainString", chainString);
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0];
    console.log("marketplaceAddress -->>", marketplaceAddress);
    const { loading, error, data, refetch } = useQuery(GET_ACTIVE_ITEMS, {
        pollInterval: 1,
    });
    let products = [];

    const content = normalizedData(homepageData?.content || []);
    const liveAuctionData = productData.filter(
        (prod) =>
            prod?.auction_date && new Date() <= new Date(prod?.auction_date)
    );
    //console.log("productData  ", productData);
    const newestData = productData
        //.filter(l => l.)
        .sort(
            (a, b) =>
                Number(new Date(b.published_at)) -
                Number(new Date(a.published_at))
        )
        .slice(0, 5);

    useEffect(() => {
        if (!loading && !error && data) {
            setListedNfts(data);
        }
    }, [loading, error, data]);

    function mapProducts(listedNfts) {
        return listedNfts?.activeItems
            .filter(
                (l) =>
                    !(
                        l.nftAddress ===
                            "0x95f7ada2206c82067e68b6191218b917eae5cc81" &&
                        l.tokenId === "2"
                    )
            )
            .map(({ price, nftAddress, tokenId, seller }, index) => {
                console.log("carlos", price, nftAddress, tokenId, seller);
                const amount = ethers.utils.formatUnits(price, "ether");
                return {
                    id: nftAddress + tokenId,
                    marketplaceAddress,
                    priceWei: price,
                    nftAddress,
                    title: "",
                    tokenId,
                    seller,
                    slug: nftAddress + tokenId,
                    price: {
                        amount: amount,
                        currency: "wETH",
                    },
                    likeCount: 0,
                    categories: ["art", "video"],
                    images: [
                        {
                            src: "/images/portfolio/lg/8.jpg",
                        },
                        {
                            src: "/images/portfolio/lg/6.jpg",
                        },
                        {
                            src: "/images/portfolio/lg/2.jpg",
                        },
                    ],
                    authors: [],
                    bitCount: 0,
                    owner: {},
                    collection: {},
                    bids: [],
                    properties: [],
                    tags: [],
                    history: [],
                    highest_bid: {},
                    sale_type: "not-for-sale",
                    level: "Intermediate",
                    language: "ENglish",
                    rating: 4,
                };
            });
    }

    return (
        <Wrapper>
            <SEO pageTitle="Explore Explore NFTs" />
            <Header />
            <main id="main-content">
                <Breadcrumb
                    pageTitle="Explore NFTs"
                    currentPage="Explore NFTs"
                />
                {/* <button onClick={() => refetch({ breed: "new_dog_breed" })}>
                    Refetch NFTs
                </button> */}
                {isWeb3Enabled && mapProducts(listedNfts) ? (
                    <ExploreProductArea
                        data={{
                            products: mapProducts(listedNfts),
                            placeBid: true,
                        }}
                    />
                ) : (
                    <div className="web3-not-enabled container">
                        <h6>Web3 Currently Not Enabled</h6>
                    </div>
                )}
            </main>
            <Footer />
        </Wrapper>
    );
};

export default Home;
