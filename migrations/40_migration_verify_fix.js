module.exports = async function (deployer, network) {
  let options = deployer.options.networks[network]
  if (options.migration) {
    let argHex = web3.eth.abi.encodeParameters(
      [
        'address',
      ],
      [
        '0x2e1d30848d48d1668b15ABbDCFb096B996089Fcf'
      ],
    )
    console.log('truffle run verify TokenVault@0x180691B0B00B806e145C0FBe5999946A70EDf8F5 --network ' + network + ' --forceConstructorArgs string:' + argHex.slice(2))
    // console.log('truffle run verify Contract@address --custom-proxy TransparentUpgradeableProxy --network ' + network + ' --forceConstructorArgs string:' + argHex.slice(2))
  }
};