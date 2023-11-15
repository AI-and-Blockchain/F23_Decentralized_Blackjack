// This script deploys contracts using Web3 library.
// Please make sure to compile all files before running this script.
// And use Right click -> "Run" from context menu of the file to run the script. Shortcut: Ctrl+Shift+S

import { deploy } from './web3-lib'

(async () => {
    // deploy BJT contract
    const BJTAddress = await (async () => {
        try {
            const result = await deploy('BJT', [])
            console.log(`Deploying BJT to address: ${result.address}`)
            return result.address
        } catch (e) {
            console.log(e.message)
        }
    })()
    // deploy Authenticator contract
    const AuthAddress = await (async () => {
        try {
            const result = await deploy('BJT', [])
            console.log(`Deploying Authenticator to address: ${result.address}`)
            return result.address
        } catch (e) {
            console.log(e.message)
        }
    })()
    // deploy Cage contract
    const CageAddress = await (async () => {
        try {
            const result = await deploy('Cage', [BJTAddress, AuthAddress])
            console.log(`Deploying Cage to address: ${result.address}`)
            return result.address
        } catch (e) {
            console.log(e.message)
        }
    })()
})()