import React, { useEffect } from 'react'
import './App.css'
import { OceanProvider } from '@oceanprotocol/react'
import { Wallet } from './Wallet'
import { Publish } from './Publish'
import { Config, ConfigHelper } from '@oceanprotocol/lib'
import { AllDdos } from './AllDdos'
import { ConsumeDdo } from './ConsumeDdo'

import WalletConnectProvider from '@walletconnect/web3-provider'
import Torus from '@toruslabs/torus-embed'
import { NetworkMonitor } from './NetworkMonitor'
import { MetadataExample } from './MetadataExample'

// factory Address needs to be updated each time you deploy the contract on local network
const config = {
  metadataStoreUri: 'http://aquarius:5000',
  providerUri: 'http://localhost:8030',
  nodeUri: `http://localhost:8545`,
  factoryAddress: '0x2fC1fd21cb222Dc180Ef817dE4c426fd9230b5A5'
} as Config

const configRinkeby = new ConfigHelper().getConfig('rinkeby')

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: ''
    }
  },
  torus: {
    package: Torus,
    options: {
      networkParams: {
        host: config.nodeUri // optional
        // chainId: 1337, // optional
        // networkId: 1337 // optional
      }
    }
  }
}

export const web3ModalOpts = {
  cacheProvider: true,
  providerOptions
}

function App() {
  const init = async () => {}

  useEffect(() => {
    init()
  }, [])

  return (
    <OceanProvider initialConfig={configRinkeby} web3ModalOpts={web3ModalOpts}>
      <div className="container">
        <NetworkMonitor />
        <div>
          <Wallet />
        </div>
        <div>
          <AllDdos />
        </div>

        <div>
          <Publish />
        </div>

        <div>
          <ConsumeDdo />
        </div>
      </div>
    </OceanProvider>
  )
}

export default App
