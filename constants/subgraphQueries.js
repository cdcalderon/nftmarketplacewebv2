import { gql } from "@apollo/client";

// Demo only
const GET_ACTIVE_ITEMS = gql`
    {
        activeItems(
            first: 2000
            where: { buyer: "0x0000000000000000000000000000000000000000" }
        ) {
            id
            buyer
            seller
            nftAddress
            tokenId
            price
        }
    }
`;
export default GET_ACTIVE_ITEMS;
