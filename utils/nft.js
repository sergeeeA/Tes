export default {
  "contractName": "House",
  "nftAbi": [
    {
      "type": "function",
      "name": "approve",
      "inputs": [
        {
          "type": "address",
          "name": "to",
          "internalType": "address"
        },
        {
          "type": "uint256",
          "name": "tokenId",
          "internalType": "uint256"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_receiver",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_quantity",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_currency",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_pricePerToken",
          "type": "uint256"
        },
        {
          "components": [
            {
              "internalType": "bytes32[]",
              "name": "proof",
              "type": "bytes32[]"
            },
            {
              "internalType": "uint256",
              "name": "quantityLimitPerWallet",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "pricePerToken",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "currency",
              "type": "address"
            }
          ],
          "internalType": "struct IDrop.AllowlistProof",
          "name": "_allowlistProof",
          "type": "tuple"
        },
        {
          "internalType": "bytes",
          "name": "_data",
          "type": "bytes"
        }
      ],
      "name": "claim",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
  ]
}
