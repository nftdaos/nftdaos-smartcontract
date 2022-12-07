const fs = require('fs');
const verify = require('truffle-plugin-verify');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = async function (deployData, config, contractName, contractAddress, customProxy, forceConstructorArgs) {
    if (contractAddress != undefined && contractAddress != '') {
        let fileName = process.cwd() + '/migrations/deployed_' + config.network + '.json';
        if (deployData.VerifiedContracts[contractAddress] == undefined || deployData.VerifiedContracts[contractAddress] == false) {
            if (config.network != 'local' && config.network != 'development' && config.network != 'test') {
                config._ = ['verify', contractName + '@' + contractAddress]
                config['custom-proxy'] = undefined
                if (customProxy != undefined && customProxy != '') {
                    config['custom-proxy'] = customProxy
                }
                config.forceConstructorArgs = undefined
                if (forceConstructorArgs != undefined && forceConstructorArgs != '') {
                    config.forceConstructorArgs = 'string:' + forceConstructorArgs
                }
                await sleep(30000)
                await verify(
                    config,
                )
            }
            deployData.VerifiedContracts[contractAddress] = true
            await fs.writeFileSync(fileName, JSON.stringify(deployData))
        }
    }
};