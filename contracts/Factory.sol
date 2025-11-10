// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GMbanditV2.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Factory is Ownable {

    struct DeploymentInfo {
        address deployedContract;
        uint256 timestamp;
    }

    // semua GMbanditV2 yg pernah dideploy oleh siapapun
    address[] public allDeployedContracts;

    // mapping user => list contract yang pernah dia deploy
    mapping(address => DeploymentInfo[]) public userDeployments;

    // event deploy
    event ContractDeployed(
        address indexed user,
        address indexed newContract,
        uint256 timestamp
    );

    constructor() Ownable(msg.sender) {}

    function deployGMbandit(
        address ownerAddress,
        address collectorAddress
    ) external returns (address) {
        GMbanditV2 newContract = new GMbanditV2(ownerAddress, collectorAddress);

        allDeployedContracts.push(address(newContract));

        userDeployments[msg.sender].push(
            DeploymentInfo({
                deployedContract: address(newContract),
                timestamp: block.timestamp
            })
        );

        emit ContractDeployed(
            msg.sender,
            address(newContract),
            block.timestamp
        );

        return address(newContract);
    }

    function getUserDeployments(address user)
        external
        view
        returns (DeploymentInfo[] memory)
    {
        return userDeployments[user];
    }

    function getAllDeployedContracts() external view returns (address[] memory) {
        return allDeployedContracts;
    }

    function countUserDeployments(address user) external view returns (uint256) {
        return userDeployments[user].length;
    }

    function totalDeployed() external view returns (uint256) {
        return allDeployedContracts.length;
    }
}
