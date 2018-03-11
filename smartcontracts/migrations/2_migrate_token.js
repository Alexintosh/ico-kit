var Token = artifacts.require("./TESTToken.sol");

module.exports = function(deployer) {
  deployer.deploy(Token);
};
