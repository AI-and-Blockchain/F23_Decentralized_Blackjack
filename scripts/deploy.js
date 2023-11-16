// This script deploys contracts using Web3 library.
// Please make sure to compile all files before running this script.
// And use Right click -> "Run" from context menu of the file to run the script. Shortcut: Ctrl+Shift+S

import 'web3-eth'

async function deploy(name, args = []) {
    // Note that the script needs the ABI which is generated from the compilation artifact.
    const metadata = JSON.parse(await remix.call('fileManager', 'getFile', `contracts/artifacts/${name}.json`))
    const accounts = await web3.eth.getAccounts()

    let contract = new web3.eth.Contract(metadata.abi)

    contract = contract.deploy({
      data: metadata.data.bytecode.object,
      arguments: args
    })

    newContractInstance = await contract.send({
      from: accounts[0],
      gas: 3000000,
      gasPrice: '30000000000'
    })

    return newContractInstance
}

// contract deployment logic
(async () => {
    const accounts = await web3.eth.getAccounts()

    const ageVerifierAddr = accounts[0]
    const mlBotAddr = accounts[0]

    try {

      console.log('START')

      // deploy BlackJackToken (ERC20)
      console.log('deploying contract BlackJackToken...')
      const BJTContract = await deploy('BlackJackToken')
      console.log(BJTContract.options.address)

      // deploy Authenticator
      console.log('deploying contract Authenticator...')
      const AuthContract = await deploy('Authenticator', [ageVerifierAddr, mlBotAddr])
      console.log(AuthContract.options.address)

      // deploy Cage
      console.log('deploying contract Cage...')
      const CageContract = await deploy('Cage', [BJTContract.options.address, AuthContract.options.address])
      console.log(CageContract.options.address)

      // grant Cage module MINTER_ROLE
      console.log('grant contract Cage the MINTER role...')
      await BJTContract.methods.grantMinterRole(CageContract.options.address).send({from: accounts[0]})

      console.log('DONE')

    } catch (e) {
      console.log(e.message)
    }
})()