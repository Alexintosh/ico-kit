import LeapContract from '../../build/contracts/Leap.json'
import Crowdsale from '../../../smartcontracts/build/contracts/Crowdsale.json'

class ContractService {
  static instance

  constructor() {
    if (ContractService.instance) {
      return ContractService.instance
    }

    ContractService.instance = this;

    this.contract = require('truffle-contract')
    this.leapContract = this.contract(LeapContract)
    //this.crowdsale = this.contract(Crowdsale)
    console.log(Crowdsale);

    this.crowdsale = window.web3.eth.contract(Crowdsale.abi);
    // window.web3 = new window.Web3(new window.Web3.providers.HttpProvider("http://127.0.0.1:7545"));

  }

  execute(data, action) {
    console.log('DATA', data);
    console.log('action:', action);
    switch (action) {
      case 'whitelist':
        return this.whitelistAddr(data.addresses)
        break;
      case 'isWhitelisted':
        return this.isWhitelisted(data.address)
        break;

      case 'updateRate':
        return this.updateRate(data.rate)
        break;

      default:
        break;
    }
  }

  get(public_var) {
    return new Promise((resolve, reject) => {
      window.web3.eth.getAccounts((error, accounts) => {
          this.crowdsale
          .at('0xdda6327139485221633a1fcd65f4ac932e60a2e1')
          [public_var](
            (error, result) => {
              resolve(result.c ? result.c : result)
            }
          );
      })
    })

  }

  updateRate(rate) {
    return new Promise((resolve, reject) => {
      window.web3.eth.getAccounts((error, accounts) => {
          this.crowdsale
          .at('0xdda6327139485221633a1fcd65f4ac932e60a2e1')
          .updateRate(
            rate,
            {from: accounts[0] },
            (error, result) => {
              console.log('result', result)
              console.log('error', error)
              resolve(result)
            }
          );
      })
    })
  }

  isWhitelisted(address) {
    return new Promise((resolve, reject) => {
      window.web3.eth.getAccounts((error, accounts) => {
          this.crowdsale
          .at('0xdda6327139485221633a1fcd65f4ac932e60a2e1')
          .whitelists(
            address,
            {from: accounts[0] },
            (error, result) => {
              console.log('result', result)
              console.log('error', error)
              resolve(result)
            }
          );
      })
    })
  }

  whitelistAddr(addresses = []) {
    return new Promise((resolve, reject) => {
      window.web3.eth.getAccounts((error, accounts) => {
          this.crowdsale
          .at('0xdda6327139485221633a1fcd65f4ac932e60a2e1')
          .whitelist(
            addresses,
            {from: accounts[0], gas: 6721975},
            (error, result) => {
              console.log('result', result)
              console.log('error', error)
              resolve(result)
            }
          );
      })
    })
  }

  getAllInvestmentById() {
    return new Promise((resolve, reject) => {
      this.leapContract.setProvider(window.web3.currentProvider)
      this.leapContract.deployed().then((instance) => {
        // Get total number of listings
        instance.listingsLength.call().then((listingsLength) => {
          function range(start, count) {
            return Array.apply(0, Array(count))
              .map(function (element, index) {
                return index + start
            });
          }
          resolve(range(0, Number(listingsLength)))
        })
        .catch((error) => {
          console.log(`Can't get number of listings.`)
          reject(error)
        })
      })
      .catch((error) => {
        console.log(`Contract not deployed`)
        reject(error)
      })
    })
  }

  waitTransactionFinished(transactionReceipt, pollIntervalMilliseconds=1000) {
    return new Promise((resolve, reject) => {
      let txCheckTimer = setInterval(txCheckTimerCallback, pollIntervalMilliseconds);
      function txCheckTimerCallback() {
        window.web3.eth.getTransaction(transactionReceipt, (error, transaction) => {
          console.log('transaction', transaction)
          if (transaction.blockNumber != null) {
            console.log(`Transaction mined at block ${transaction.blockNumber}`)
            console.log(transaction)
            // TODO: Wait maximum number of blocks
            // TODO: Confirm transaction *sucessful* with getTransactionReceipt()

            // // TODO (Stan): Metamask web3 doesn't have this method. Probably could fix by
            // // by doing the "copy local web3 over metamask's" technique.
            // window.web3.eth.getTransactionReceipt(this.props.transactionReceipt, (error, transactionReceipt) => {
            //   console.log(transactionReceipt)
            // })

            clearInterval(txCheckTimer)
            // Hack to wait two seconds, as results don't seem to be
            // immediately available.
            setTimeout(()=>resolve(transaction.blockNumber), 2000)
          }
        })
      }
    })
  }
}

const contractService = new ContractService()

export default contractService


