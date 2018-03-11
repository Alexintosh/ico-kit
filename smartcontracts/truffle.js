module.exports = {
  migrations_directory: "./migrations",
  networks: {
    development: {
      host: "localhost",
      port: 7545,
      network_id: "*" // Match any network id
    },

    rinkeby: {
      host: "localhost", // Connect to geth on the specified
      port: 8545,
      from: "", // default address to use for any transaction Truffle makes during migrations
      network_id: 4, // Kiberny
      gas: 4612388 // Gas limit used for deploys
    }
  },
  //solc: { optimizer: { enabled: true, runs: 200 } }
};