const FORWARD = {
  "constant": false,
  "inputs": [
    {
      "name": "evmCallScript",
      "type": "bytes"
    }
  ],
  "name": "forward",
  "outputs": [],
  "payable": false,
  "stateMutability": "nonpayable",
  "type": "function"
}

const KERNEL_NEW_APP_INSTANCE = {
  "constant": false,
  "inputs": [
    {
      "name": "_appId",
      "type": "bytes32"
    },
    {
      "name": "_appBase",
      "type": "address"
    },
    {
      "name": "_initializePayload",
      "type": "bytes"
    },
    {
      "name": "_setDefault",
      "type": "bool"
    }
  ],
  "name": "newAppInstance",
  "outputs": [
    {
      "name": "appProxy",
      "type": "address"
    }
  ],
  "payable": false,
  "stateMutability": "nonpayable",
  "type": "function"
}

const ACL_CREATE_PERMISSION = {
  "constant": false,
  "inputs": [
    {
      "name": "_entity",
      "type": "address"
    },
    {
      "name": "_app",
      "type": "address"
    },
    {
      "name": "_role",
      "type": "bytes32"
    },
    {
      "name": "_manager",
      "type": "address"
    }
  ],
  "name": "createPermission",
  "outputs": [
  ],
  "payable": false,
  "stateMutability": "nonpayable",
  "type": "function"
}

const ACL_GRANT_PERMISSION = {
  "constant": false,
  "inputs": [
    {
      "name": "_entity",
      "type": "address"
    },
    {
      "name": "_app",
      "type": "address"
    },
    {
      "name": "_role",
      "type": "bytes32"
    }
  ],
  "name": "grantPermission",
  "outputs": [
  ],
  "payable": false,
  "stateMutability": "nonpayable",
  "type": "function"
}

const ACL_REVOKE_PERMISSION = {
  "constant": false,
  "inputs": [
    {
      "name": "_entity",
      "type": "address"
    },
    {
      "name": "_app",
      "type": "address"
    },
    {
      "name": "_role",
      "type": "bytes32"
    }
  ],
  "name": "revokePermission",
  "outputs": [
  ],
  "payable": false,
  "stateMutability": "nonpayable",
  "type": "function"
}

const VOTING_NEW_VOTE = {
  "constant": false,
  "inputs": [
    {
      "name": "_executionScript",
      "type": "bytes"
    },
    {
      "name": "_metadata",
      "type": "string"
    }
  ],
  "name": "newVote",
  "outputs": [
    {
      "name": "voteId",
      "type": "uint256"
    }
  ],
  "payable": false,
  "stateMutability": "nonpayable",
  "type": "function"
}

const TOKEN_MANAGER_INITIALIZE = {
  "constant": false,
  "inputs": [
    {
      "name": "_token",
      "type": "address"
    },
    {
      "name": "_transferable",
      "type": "bool"
    },
    {
      "name": "_maxAccountTokens",
      "type": "uint256"
    }
  ],
  "name": "initialize",
  "outputs": [
  ],
  "payable": false,
  "stateMutability": "nonpayable",
  "type": "function"
}

const TOKEN_MANAGER_MINT = {
  "constant": false,
  "inputs": [
    {
      "name": "_receiver",
      "type": "address"
    },
    {
      "name": "_amount",
      "type": "uint256"
    }
  ],
  "name": "mint",
  "outputs": [
  ],
  "payable": false,
  "stateMutability": "nonpayable",
  "type": "function"
}

const DELAY_INITIALIZE = {
  "constant": false,
  "inputs": [
    {
      "name": "_executionDelay",
      "type": "uint64"
    }
  ],
  "name": "initialize",
  "outputs": [
  ],
  "payable": false,
  "stateMutability": "nonpayable",
  "type": "function"
}

module.exports = {
  FORWARD,
  KERNEL_NEW_APP_INSTANCE,
  ACL_CREATE_PERMISSION,
  ACL_GRANT_PERMISSION,
  ACL_REVOKE_PERMISSION,
  VOTING_NEW_VOTE,
  TOKEN_MANAGER_INITIALIZE,
  TOKEN_MANAGER_MINT,
  DELAY_INITIALIZE,
}
