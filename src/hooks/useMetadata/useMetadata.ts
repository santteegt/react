import { useState, useEffect } from 'react'
import { DID, DDO, Metadata, Logger } from '@oceanprotocol/lib'
import { useOcean } from '../../providers'
import ProviderStatus from '../../providers/OceanProvider/ProviderStatus'
import { getBestDataTokenPrice, getCheapestPool } from '../../utils/dtUtils'
import Pool from './Pool'
import { isDDO } from '../../utils'

interface UseMetadata {
  ddo: DDO
  did: DID | string
  metadata: Metadata
  title: string
  price: string
  poolAddress: string
  isLoaded: boolean
  getPrice: (dataTokenAddress?: string) => Promise<string>
  getPool: (dataTokenAddress?: string) => Promise<Pool>
}

function useMetadata(asset?: DID | string | DDO): UseMetadata {
  const { ocean, status, config, accountId } = useOcean()
  const [internalDdo, setDDO] = useState<DDO | undefined>()
  const [internalDid, setDID] = useState<DID | string | undefined>()
  const [metadata, setMetadata] = useState<Metadata | undefined>()
  const [title, setTitle] = useState<string | undefined>()
  const [isLoaded, setIsLoaded] = useState(false)
  const [price, setPrice] = useState<string | undefined>()
  const [poolAddress, setPoolAddress] = useState<string | undefined>()

  async function getDDO(did: DID | string): Promise<DDO> {
    if (status === ProviderStatus.CONNECTED) {
      const ddo = await ocean.metadatastore.retrieveDDO(did)
      return ddo
    }
  }

  async function getPrice(dataTokenAddress?: string): Promise<string> {
    if (!dataTokenAddress) dataTokenAddress = internalDdo.dataToken
    return await getBestDataTokenPrice(ocean, accountId, dataTokenAddress)
  }
  async function getPool(dataTokenAddress?: string): Promise<Pool> {
    if (!dataTokenAddress) dataTokenAddress = internalDdo.dataToken
    return await getCheapestPool(ocean, accountId, dataTokenAddress)
  }

  async function getMetadata(): Promise<Metadata> {
    if (!internalDdo) return
    const metadata = internalDdo.findServiceByType('metadata')
    return metadata.attributes
  }

  async function getTitle(): Promise<string> {
    const metadata = await getMetadata()
    return metadata.main.name
  }

  useEffect(() => {
    async function init(): Promise<void> {
      Logger.debug('meta init', status)
      if (ocean && status === ProviderStatus.CONNECTED) {
        if (!asset) return

        if (isDDO(asset)) {
          setDDO(asset)
          setDID(asset.id)
        } else {
          const ddo = await getDDO(asset)
          Logger.debug('DDO', ddo)
          setDDO(ddo)
          setDID(asset)
        }
      }
    }
    init()
  }, [ocean, status])

  useEffect(() => {
    if (!accountId) return

    async function init(): Promise<void> {
      if (internalDdo) {
        const metadata = await getMetadata()
        setMetadata(metadata)
        setTitle(metadata.main.name)
        const pool = await getPool()
        setPoolAddress(pool.address)
        setPrice(pool.price)
        setIsLoaded(true)
      }
    }
    init()

    const interval = setInterval(async () => {
      const pool = await getPool()
      setPoolAddress(pool.address)
      setPrice(pool.price)
    }, 10000)
    return () => clearInterval(interval)
  }, [accountId, internalDdo])

  return {
    ddo: internalDdo,
    did: internalDid,
    metadata,
    title,
    price,
    poolAddress,
    isLoaded,
    getPrice,
    getPool
  }
}

export { useMetadata, UseMetadata }
export default useMetadata
