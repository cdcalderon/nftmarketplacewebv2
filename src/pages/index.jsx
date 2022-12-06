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

export async function getStaticProps() {
    return { props: { className: "template-color-1" } };
}

const Home = () => {
    const { isWeb3Enabled, chainId } = useMoralis();
    const chainString = chainId ? parseInt(chainId).toString() : "31337";
    console.log(chainString);
    console.log("chainString", chainString);
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0];
    console.log("marketplaceAddress -->>", marketplaceAddress);
    const { loading, error, data: listedNfts } = useQuery(GET_ACTIVE_ITEMS);
    let products = [];

    const content = normalizedData(homepageData?.content || []);
    const liveAuctionData = productData.filter(
        (prod) =>
            prod?.auction_date && new Date() <= new Date(prod?.auction_date)
    );
    const newestData = productData
        .sort(
            (a, b) =>
                Number(new Date(b.published_at)) -
                Number(new Date(a.published_at))
        )
        .slice(0, 5);

    function mapProducts(listedNfts) {
        return listedNfts?.activeItems.map(
            ({ price, nftAddress, tokenId, seller }, index) => {
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
                    likeCount: 345,
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
            }
        );
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
                {isWeb3Enabled && mapProducts(listedNfts) ? (
                    <ExploreProductArea
                        data={{
                            products: mapProducts(listedNfts),
                            placeBid: true,
                        }}
                    />
                ) : (
                    <div>Web3 Currently Not Enabled</div>
                )}
            </main>
            <Footer />
        </Wrapper>
    );
};

export default Home;
