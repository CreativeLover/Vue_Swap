<template>
  <v-app>
    <div class="wrapper">
      <header class="header">
        <div class="header__inner">
          <div class="header__logo">
            <a class="logo" href="#">
              <span class="logo__hover">
                <img src="/images/general/logo-hover.svg" alt="" />
              </span>
              <span class="logo__img">
                <img src="/images/general/logo.png" alt="" />
              </span>
            </a>
          </div>

          <v-dialog v-model="dialog" max-width="300">
            <template #activator="{ on, attrs }">
              <div
                v-if="!controllerInfo || controllerInfo.PSD"
                class="header__btn"
                disabled
              >
                <span class="btn header__link">{{ connectButtonLabel }}</span>
              </div>

              <div v-else class="header__btn" v-bind="attrs" v-on="on">
                <span class="btn header__link">{{ connectButtonLabel }}</span>
                <v-icon v-if="wallet" right>mdi-check</v-icon>
              </div>
            </template>

            <div class="connect-modal__content">
              <div class="connect-modal__content-inner">
                <div class="connect-modal__title">Connect using:</div>
                <div class="connect-modal__links">
                  <div
                    :disabled="providerType === 'M'"
                    @click="clickConnectMetamask"
                    class="connect-modal__link btn"
                  >
                    METAMASK
                  </div>

                  <div
                    :disabled="providerType === 'W'"
                    @click="clickConnectWalletconnect"
                    class="connect-modal__link btn"
                  >
                    CONNECTWALLET
                  </div>
                </div>
              </div>
            </div>
          </v-dialog>
        </div>
      </header>

      <main class="main">
        <div class="two_buttons">
          <router-link to="/">
            <span class="btn header__link" @click="stablehanler">
              Native Token
            </span>
          </router-link>
          <router-link to="/stableToken">
            <span class="btn header__link">
              Stable Token
            </span>
          </router-link>
        </div>
        <div class="swapper">
          <div class="swapper__inner">
            <div class="swapper__row">
              <div class="swapper__col">
                <v-select
                  outlined
                  :value="FromToken"
                  :items="Tokens"
                  :disabled="!!loading_swapping"
                  @change="selectFromOnChangeHandler"
                  label="Select from"
                  solo
                >
                  <v-icon slot="append" size="12">fa fa-chevron-down</v-icon>

                  <template v-slot:selection="{ item }">
                    <img
                      v-if="FromToken === 'DBX Smart Network (DBX-20)'"
                      src="/dbx.svg"
                    />
                    <img
                      v-if="FromToken === 'Ethereum (ERC-20)'"
                      src="/Ethereum.svg"
                    />
                    <img
                      v-if="FromToken === 'Binance Smart Chain (BEP-20)'"
                      src="/Binance.svg"
                    />

                    <span class="select-btn__output-txt">{{ item }}</span>
                  </template>

                  <template v-slot:item="{ item }">
                    <img
                      v-if="item === 'DBX Smart Network (DBX-20)'"
                      src="/dbx.svg"
                    />
                    <img
                      v-if="item === 'Ethereum (ERC-20)'"
                      src="/Ethereum.svg"
                    />
                    <img
                      v-if="item === 'Binance Smart Chain (BEP-20)'"
                      src="/Binance.svg"
                    />
                    {{ item }}
                  </template>
                </v-select>

                <div class="swapper-quantity">
                  <div class="swapper-quantity__item">
                    Balance:
                    <span>{{ BNStrToNumstr(dirBalance[0]) }} DBX</span>
                  </div>
                  <div class="swapper-quantity__item">
                    Approved:
                    <span>{{ BNStrToNumstr(currentApproved) }} DBX</span>
                  </div>
                  <div class="swapper-quantity__item">
                    Fee:
                    <span>
                      {{ controllerInfo ? BNStrToNumstr(feeBNStr) : '...' }} DBX
                    </span>
                  </div>
                  <div class="swapper-quantity__item">
                    Min:
                    <span>{{ BNStrToNumstr(minBNStr) }} DBX</span>
                  </div>
                </div>
              </div>
              <div class="swapper__col">
                <v-select
                  style="height: 70px;"
                  outlined
                  :value="ToToken"
                  :items="Tokens"
                  :disabled="!!loading_swapping"
                  @change="selectToOnChangeHandler"
                  label="Select to"
                  solo
                >
                  <v-icon slot="append" size="12">fa fa-chevron-down</v-icon>
                  <template v-slot:selection="{ item }">
                    <img
                      v-if="ToToken === 'DBX Smart Network (DBX-20)'"
                      src="/dbx.svg"
                    />
                    <img
                      v-if="ToToken === 'Ethereum (ERC-20)'"
                      src="/Ethereum.svg"
                    />
                    <img
                      v-if="ToToken === 'Binance Smart Chain (BEP-20)'"
                      src="/Binance.svg"
                    />
                    <span class="select-btn__output-txt">{{ item }}</span>
                  </template>

                  <template v-slot:item="{ item }">
                    <img
                      v-if="item === 'DBX Smart Network (DBX-20)'"
                      src="/dbx.svg"
                    />
                    <img
                      v-if="item === 'Ethereum (ERC-20)'"
                      src="/Ethereum.svg"
                    />
                    <img
                      v-if="item === 'Binance Smart Chain (BEP-20)'"
                      src="/Binance.svg"
                    />

                    {{ item }}
                  </template>
                </v-select>

                <div class="swapper-quantity">
                  <div class="swapper-quantity__item">
                    Balance:
                    <span>{{ BNStrToNumstr(dirBalance[1]) }} DBX</span>
                  </div>
                  <div class="swapper-quantity__item">
                    Will receive:
                    <span>
                      {{
                        amountEnough && controllerInfo
                          ? '~' +
                            BNStrToNumstr(
                              substractFee(
                                amountBN.toString(),
                                feeBNStr,
                              ).toString(),
                            )
                          : '...'
                      }}
                      DBX
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div class="swapper__amount">
              <div class="swapper-amount">
                <div class="swapper-amount__title">Amount:</div>

                <div class="swapper-amount__field-wrapper">
                  <v-text-field
                    v-if="contractInfoOk"
                    v-model="inputAmount"
                    :append-icon="
                      approvedEnough && !approvedEqual
                        ? 'mdi-restore'
                        : canMaximizeAmount
                        ? 'mdi-arrow-collapse-up'
                        : ''
                    "
                    :rules="[
                      () => amountValid || 'Enter proper amount',
                      () => amountEnough || 'Amount is too low',
                      () => balanceEnough || 'Balance too low',
                    ]"
                    label="Choose the vacancy"
                    placeholder="123.456..."
                    required
                    @click:append="handleClickAppend"
                  />

                  <v-text-field
                    v-else
                    outlined
                    label="Choose the vacancy"
                    disabled
                  />
                </div>
              </div>
            </div>

            <button
              class="swapper__controls"
              :loading="loading_swapping"
              v-if="requestDisabled"
              disabled
              @click="handleClickRequest"
            >
              <span class="btn swapper__link">
                SWAP
              </span>
            </button>
            <button
              class="swapper__controls"
              :loading="loading_swapping"
              v-else
              @click="handleClickRequest"
            >
              <span class="btn swapper__link">
                SWAP
              </span>
            </button>
          </div>

          <v-card-text v-if="hashes && hashes_url && hashes_names">
            Transaction hashes:
            <br />
            Collect ({{ hashes_names.C }})
            <a
              :href="`${hashes_url.C}/tx/${hashes.txHashCollect}`"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ hashes.txHashCollect }}
            </a>
            <br />
            Dispense ({{ hashes_names.D }})
            <a
              :href="`${hashes_url.D}/tx/${hashes.txHashDispense}`"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ hashes.txHashDispense }}
            </a>
          </v-card-text>
        </div>

        <div
          v-if="
            loadingMessage ||
            errorMessage ||
            warningMessage ||
            inBetween ||
            hashes
          "
          class="message-container"
        >
          <v-alert v-if="loadingMessage" outlined type="info">
            {{ loadingMessage }}
          </v-alert>

          <v-alert v-if="errorMessage" dismissible outlined type="error">
            {{ errorMessage }}
          </v-alert>

          <v-alert v-if="warningMessage" dismissible outlined type="warning">
            {{ warningMessage }}
          </v-alert>

          <v-alert v-if="inBetween" outlined type="info">
            Value sent. Sending request to controller. It might take up to 5min,
            please wait...
          </v-alert>

          <v-alert v-if="hashes" outlined type="success">
            Success! Save transaction hashes below
          </v-alert>
        </div>
      </main>

      <div class="decor">
        <div class="decor__img decor__img--1">
          <picture>
            <source srcset="/images/general/decor-1.png" type="image/webp" />
            <img
              src="/images/general/decor-1.png"
              width="525"
              height="561"
              alt="img"
            />
          </picture>
        </div>
        <div class="decor__img decor__img--2">
          <picture>
            <source srcset="/images/general/decor-2.png" type="image/webp" />
            <img
              src="/images/general/decor-2.png"
              width="268"
              height="268"
              alt="img"
            />
          </picture>
        </div>
        <div class="decor__img decor__img--3">
          <picture>
            <source srcset="/images/general/decor-3.png" type="image/webp" />
            <img
              src="/images/general/decor-3.png"
              width="603"
              height="312"
              alt="img"
            />
          </picture>
        </div>
        <div class="decor__img decor__img--4">
          <picture>
            <source srcset="/images/general/decor-4.png" type="image/webp" />
            <img
              src="/images/general/decor-4.png"
              width="1188"
              height="516"
              alt="img"
            />
          </picture>
        </div>
        <div class="decor__img decor__img--5">
          <picture>
            <source srcset="/images/general/decor-5.png" type="image/webp" />
            <img
              src="/images/general/decor-5.png"
              width="637"
              height="799"
              alt="img"
            />
          </picture>
        </div>
        <div class="decor__img decor__img--6">
          <picture>
            <source srcset="/images/general/decor-6.png" type="image/webp" />
            <img
              src="/images/general/decor-6.png"
              width="408"
              height="573"
              alt="img"
            />
          </picture>
        </div>
      </div>
    </div>
  </v-app>
</template>

<script lang="ts">
/* eslint-disable camelcase */
/* eslint-disable no-console */
import Vue from 'vue'
import { Contract, providers, BigNumber } from 'ethers'
import Axios from 'axios'
import Token from '~/abis/Token.json'
import BridgeAssist from '~/abis/BridgeAssist.json'

const address_BABE = '0xE562014651C191178CA2Be7f86910760Ce957C7f'
const address_BABX = '0x3A893beAC002c85CB6D85865C66093F420483FE2'
const address_BAEB = '0x227996B1f17c5E8caB4Cc843124f0Cf6399d37D9'
const address_BAEX = '0xd274515b94fAb45639136a5BFF74F704509680c7'

const address_BAX = '0x547e9337C88ADFe32C2A9e5273F281b813FB085D'
const address_TKNB = '0x67dcAa9468c219ad81F5825EF0c8f58879c657dd'
const address_TKNE = '0x3cbc780d2934d55a06069e837fabd3e6fc23dab0'

const _providerB = new providers.JsonRpcProvider(
  'https://bsc-dataseed.binance.org/',
) // for reading contracts
const _providerE = new providers.InfuraProvider(
  1,
  '976b8b2358be48468b36d8739e79414e',
) // for reading contracts
const _providerX = new providers.JsonRpcProvider('https://dbxnode.com') // for reading contracts
const TKNE = new Contract(address_TKNE, Token.abi, _providerE)
const TKNB = new Contract(address_TKNB, Token.abi, _providerB)

const BAX = new Contract(address_BAX, BridgeAssist.abi, _providerX)

const JSONRPC_BSC = {
  id: 1,
  jsonrpc: '2.0',
  method: 'wallet_addEthereumChain',
  params: [
    {
      chainName: 'Binance Smart Chain Mainnet',
      chainId: '0x38',
      nativeCurrency: {
        name: 'Binance Chain Native Token',
        symbol: 'BNB',
        decimals: 18,
      },
      rpcUrls: [
        'https://bsc-dataseed1.binance.org',
        'https://bsc-dataseed2.binance.org',
        'https://bsc-dataseed3.binance.org',
        'https://bsc-dataseed4.binance.org',
        'https://bsc-dataseed1.defibit.io',
        'https://bsc-dataseed2.defibit.io',
        'https://bsc-dataseed3.defibit.io',
        'https://bsc-dataseed4.defibit.io',
        'https://bsc-dataseed1.ninicoin.io',
        'https://bsc-dataseed2.ninicoin.io',
        'https://bsc-dataseed3.ninicoin.io',
        'https://bsc-dataseed4.ninicoin.io',
        'wss://bsc-ws-node.nariox.org',
      ],
      blockExplorerUrls: ['https://bscscan.com'],
      iconUrls: [
        'https://cryptologos.cc/logos/binance-coin-bnb-logo.svg',
        'https://cryptologos.cc/logos/binance-coin-bnb-logo.png',
      ],
    },
  ],
}

const Tokens = [
  'Ethereum (ERC-20)',
  'Binance Smart Chain (BEP-20)',
  'DBX Smart Network (DBX-20)',
]

function _wait(ms = 20000) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function removeTrailingZeros(str: string): string {
  if (str === '0') return str
  if (str.slice(-1) === '0')
    return removeTrailingZeros(str.substr(0, str.length - 1))
  if (str.slice(-1) === '.') return str.substr(0, str.length - 1)
  return str
}
function numstrToBN(input: string): BigNumber {
  const spl = input.split('.')
  if (spl[1]) spl[1] = spl[1].substr(0, 18)
  return BigNumber.from(
    spl.join('') + '000000000000000000'.substr(0, 18 - (spl[1] || '').length),
  )
}
function BNStrToNumstr(str: string, precision = 3): string {
  if (str === '0') return str
  if (isNaN(Number(str))) return 'NaN'
  if (str.length <= 18)
    return removeTrailingZeros(
      ('0.' + '000000000000000000'.substr(0, 18 - str.length) + str).substr(
        0,
        18 - str.length + precision + 2,
      ),
    )
  else
    return [str.substr(0, str.length - 18), str.slice(-18)]
      .join('.')
      .substr(0, str.length - 18 + precision + 1)
}
function substractFee(amount: string, fee: string) {
  return BigNumber.from(amount).sub(fee)
}
type DirectionType = 'EB' | 'BE' | 'EX' | 'BX' | 'XE' | 'XB'
export default Vue.extend({
  data() {
    return {
      Tokens,
      FromToken: 'Ethereum (ERC-20)',
      ToToken: 'Binance Smart Chain (BEP-20)',
      provider: null as providers.Web3Provider | null,
      signer: null as providers.JsonRpcSigner | null,
      wallet: '',
      direction: 'EB' as DirectionType,
      approvedEB: '',
      approvedEX: '',
      approvedBE: '',
      approvedBX: '',
      approvedX: '',
      approvedX_dirE: false,
      balanceE: '',
      balanceB: '',
      balanceX: '',
      inputAmount: '',
      controllerInfo: null as {
        BE: string
        EB: string
        EX: string
        BX: string
        XE: string
        XB: string
        PSD: boolean
      } | null,
      errorMessage_misc: '',
      warningMessage: '',
      successMessage: '',
      loading_swapping: false,
      loading_approve: false,
      loading_request: false,
      loading_provider: false,
      loading_controllerInfo: true,
      loading_contractInfo: false,
      loading_add: false,
      paused_chainIdHandler: false,
      inBetween: false,
      hashes: null as { txHashCollect: string; txHashDispense: string } | null,
      hashes_url: null as { C: string; D: string } | null,
      hashes_names: null as { C: string; D: string } | null,
      dialog: false,
      dialog_help: false,
      chainId: null as null | number,
    }
  },
  computed: {
    // MESSAGES
    connectButtonLabel(): string {
      return this.wallet
        ? this.wallet.substr(0, 6) + '...' + this.wallet.substr(-4)
        : 'Connect'
    },
    loadingMessage(): string {
      return this.loading_controllerInfo
        ? 'Loading controller info...'
        : this.loading_provider
        ? 'Connecting provider...'
        : this.loading_contractInfo
        ? 'Loading contract info...'
        : ''
    },
    err_controllerInfo(): boolean {
      return !this.loading_controllerInfo && !this.controllerInfo
    },
    err_shutDown(): boolean {
      return this.preShutDown
    },
    err_chainId(): boolean {
      return (
        !!this.chainId &&
        this.chainId !==
          { EB: 1, BE: 56, EX: 1, BX: 56, XE: 5348, XB: 5348 }[this.direction]
      )
    },
    err_balanceLow(): boolean {
      return (
        !!this.dirBalance[0] &&
        BigNumber.from(this.dirBalance[0]).lt(this.minBNStr)
      )
    },
    errorMessage(): string {
      return this.err_controllerInfo
        ? 'Could not load info from controller. Usage is blocked. Try refreshing the page'
        : this.err_shutDown
        ? 'Controller will soon shut down for maintenance. Usage is blocked. Please wait'
        : this.err_chainId
        ? `You selected wrong network for this direction. Select ${
            this.dirChainName[0]
          } in your provider${
            this.providerType === 'M' ? '' : ' and refresh the page'
          }`
        : this.err_balanceLow
        ? 'Your balance is lower than minimum amount. Usage is blocked'
        : this.errorMessage_misc
    },
    smAndUp(): boolean {
      return (this as any).$vuetify.breakpoint.smAndUp
    },
    providerType(): 'N' | 'W' | 'M' {
      return !this.provider
        ? 'N'
        : this.provider.provider.isMetaMask
        ? 'M'
        : 'W'
    },
    dirChainName(): string[] {
      return {
        EB: ['Ethereum (ERC-20)', 'Binance Smart Chain (BEP-20)'],
        BE: ['Binance Smart Chain (BEP-20)', 'Ethereum (ERC-20)'],
        EX: ['Ethereum (ERC-20)', 'DBX Smart Network (DBX-20)'],
        BX: ['Binance Smart Chain (BEP-20)', 'DBX Smart Network (DBX-20)'],
        XE: ['DBX Smart Network (DBX-20)', 'Ethereum (ERC-20)'],
        XB: ['DBX Smart Network (DBX-20)', 'Binance Smart Chain (BEP-20)'],
      }[this.direction]
    },
    dirChainNameShort(): string[] {
      return {
        EB: ['ETH', 'BSC'],
        BE: ['BSC', 'ETH'],
        EX: ['ETH', 'DBX'],
        BX: ['BSC', 'DBX'],
        XE: ['DBX', 'ETH'],
        XB: ['DBX', 'BSC'],
      }[this.direction]
    },
    dirChainExplorer(): string[] {
      return {
        EB: ['https://etherscan.io', 'https://bscscan.com'],
        BE: ['https://bscscan.com', 'https://etherscan.io'],
        EX: ['https://etherscan.io', 'https://dbxscan.com'],
        BX: ['https://bscscan.com', 'https://dbxscan.com/'],
        XE: ['https://dbxscan.com/', 'https://etherscan.io'],
        XB: ['https://dbxscan.com/', 'https://bscscan.com'],
      }[this.direction]
    },
    dirChainLogo(): string[] {
      return {
        EB: ['/ethereumlogo.png', '/binancelogo.png'],
        BE: ['/binancelogo.png', '/ethereumlogo.png'],
        EX: ['/ethereumlogo.png', '/dbxlogo.png'],
        BX: ['/binancelogo.png', '/dbxlogo.png'],
        XE: ['/dbxlogo.png', '/ethereumlogo.png'],
        XB: ['/dbxlogo.png', '/binancelogo.png'],
      }[this.direction]
    },
    dirBalance(): string[] {
      return {
        EB: [this.balanceE, this.balanceB],
        BE: [this.balanceB, this.balanceE],
        EX: [this.balanceE, this.balanceX],
        BX: [this.balanceB, this.balanceX],
        XE: [this.balanceX, this.balanceE],
        XB: [this.balanceX, this.balanceB],
      }[this.direction]
    },
    currentApproved(): string {
      return {
        EB: this.approvedEB,
        BE: this.approvedBE,
        EX: this.approvedEX,
        BX: this.approvedBX,
        XE: this.approvedX,
        XB: this.approvedX,
      }[this.direction]
    },
    // TECHNICAL OK
    preShutDown(): boolean {
      return !!this.controllerInfo?.PSD
    },
    contractInfoOk(): boolean {
      return !!this.currentApproved && !!this.dirBalance[0]
    },
    allSafe(): boolean {
      return (
        !!this.wallet &&
        !!this.controllerInfo &&
        this.contractInfoOk &&
        !this.errorMessage &&
        !this.loading_controllerInfo &&
        !this.loading_provider &&
        !this.loading_contractInfo
      )
    },
    // VALID DATA
    approvedEqual(): boolean {
      return this.amountBN.eq(this.currentApproved)
    },
    amountValid(): boolean {
      return !!Number(this.inputAmount)
    },
    approvedNonZero(): boolean {
      return this.approvedBN.gt(0)
    },
    // ENOUGH
    amountEnough(): boolean {
      return this.minBNStr ? this.amountBN.gte(this.minBNStr) : false
    },
    balanceEnough(): boolean {
      return this.amountBN.lte(this.dirBalance[0])
    },
    approvedEnough(): boolean {
      if (!this.controllerInfo) return false
      return this.approvedBN.gte(this.minBNStr)
    },
    // BUTTONS DISABLED
    requestDisabled(): boolean {
      return !(
        this.allSafe &&
        this.amountValid &&
        this.amountEnough &&
        this.balanceEnough
      )
    },
    canMaximizeAmount(): boolean {
      return !this.approvedNonZero && this.amountBN.lt(this.dirBalance[0])
    },
    // CONVERTERS
    amountBN(): BigNumber {
      return this.amountValid
        ? numstrToBN(this.inputAmount.trim())
        : BigNumber.from(0)
    },
    approvedBN(): BigNumber {
      return BigNumber.from(this.currentApproved || 0)
    },
    feeBNStr(): string {
      if (!this.controllerInfo) return ''
      return this.controllerInfo[this.direction]
    },
    minBNStr(): string {
      if (!this.controllerInfo) return ''
      return (this.controllerInfo as any)['MIN_' + this.direction]
    },
  },
  async mounted() {
    if (!this.smAndUp) window.scrollTo(0, 160)
    await this.loadControllerInfo()
  },
  methods: {
    BNStrToNumstr,
    substractFee,
    async updateChainId() {
      this.chainId = (await this.provider?.getNetwork())?.chainId || null
    },
    async clickConnectWalletconnect() {
      this.dialog = false
      if (this.providerType === 'M') this.wallet = ''
      await this.connectWalletconnect()
      if (this.wallet) await this.loadContractInfo()
      if (this.contractInfoOk && this.approvedNonZero) this.restoreInputAmount()
    },
    async connectWalletconnect() {
      this.loading_provider = true
      try {
        const WalletConnectProvider = require('@walletconnect/web3-provider')
          .default
        const wc = new WalletConnectProvider(
          this.direction === 'EB' || this.direction === 'EX'
            ? {
                rpc: {
                  1: 'https://mainnet.infura.io/v3/f91771c75ee2409198e8ea8561bfaea8',
                },
                chainId: 1,
                qrcode: true,
              }
            : this.direction === 'XB' || this.direction === 'XE'
            ? {
                rpc: { 5348: 'https://dbxnode.com' },
                chainId: 5348,
                qrcode: true,
              }
            : {
                rpc: { 56: 'https://bsc-dataseed.binance.org/' },
                chainId: 56,
                qrcode: true,
              },
        )
        await wc.enable()
        this.provider = new providers.Web3Provider(wc)
        this.signer = this.provider.getSigner()
        this.wallet = await this.signer.getAddress()
        await this.updateChainId()
      } catch (error) {
        this.errorMessage_misc =
          'Could not connect Walletconnect. Error: ' + error.message
        console.error(error)
      }
      this.loading_provider = false
    },
    async clickConnectMetamask() {
      this.dialog = false
      if (this.providerType === 'W') this.wallet = ''
      await this.connectMetamask()
      ;(window.ethereum as any).on('chainChanged', async (chainId: string) => {
        console.log({ chainId })
        if (this.loading_swapping) {
          this.paused_chainIdHandler = true
          return
        }
        if (!this.paused_chainIdHandler) this.hashes = null
        switch (chainId) {
          case '0x1':
            if (this.ToToken == 'Ethereum (ERC-20)') {
              this.ToToken = this.FromToken
              this.direction = (this.direction[1] +
                this.direction[0]) as DirectionType
            }
            this.direction = ('E' + this.direction[1]) as DirectionType
            this.FromToken = 'Ethereum (ERC-20)'
            break
          case '0x38':
            if (this.ToToken == 'Binance Smart Chain (BEP-20)') {
              this.ToToken = this.FromToken
              this.direction = (this.direction[1] +
                this.direction[0]) as DirectionType
            }
            this.direction = ('B' + this.direction[1]) as DirectionType
            this.FromToken = 'Binance Smart Chain (BEP-20)'
            break
          case '0x14E4':
            if (this.ToToken == 'DBX Smart Network (DBX-20)') {
              this.ToToken = this.FromToken
              this.direction = (this.direction[1] +
                this.direction[0]) as DirectionType
            }
            this.direction = ('X' + this.direction[1]) as DirectionType
            this.FromToken = 'DBX Smart Network (DBX-20)'
            break
          default:
            return
        }
        await this.connectMetamask()
        if (this.contractInfoOk && this.approvedNonZero)
          this.restoreInputAmount()
      })
      if (this.wallet) await this.loadContractInfo()
      if (this.contractInfoOk && this.approvedNonZero) this.restoreInputAmount()
    },
    async connectMetamask() {
      this.loading_provider = true
      try {
        if (!window.ethereum) throw new Error('Please set up MetaMask properly')
        await (window.ethereum as any).enable()
        this.provider = new providers.Web3Provider(
          (window.ethereum as any) || window.web3,
        )
        this.signer = this.provider.getSigner()
        this.wallet = await this.signer.getAddress()
        await this.updateChainId()
        if (!this.paused_chainIdHandler) this.hashes = null
        switch (this.chainId) {
          case 1:
            if (this.ToToken == 'Ethereum (ERC-20)') {
              this.ToToken = this.FromToken
              this.direction = (this.direction[1] +
                this.direction[0]) as DirectionType
            }
            this.direction = ('E' + this.direction[1]) as DirectionType
            this.FromToken = 'Ethereum (ERC-20)'
            break
          case 56:
            if (this.ToToken == 'Binance Smart Chain (BEP-20)') {
              this.ToToken = this.FromToken
              this.direction = (this.direction[1] +
                this.direction[0]) as DirectionType
            }
            this.direction = ('B' + this.direction[1]) as DirectionType
            this.FromToken = 'Binance Smart Chain (BEP-20)'
            break
          case 5348:
            if (this.ToToken == 'DBX Smart Network (DBX-20)') {
              this.ToToken = this.FromToken
              this.direction = (this.direction[1] +
                this.direction[0]) as DirectionType
            }
            this.direction = ('X' + this.direction[1]) as DirectionType
            this.FromToken = 'DBX Smart Network (DBX-20)'
            break
          default:
            return
        }
      } catch (error) {
        this.errorMessage_misc =
          'Could not connect MetaMask. Error: ' + error.messagee
        console.error(error)
      }
      this.loading_provider = false
    },
    restoreInputAmount() {
      this.inputAmount = removeTrailingZeros(
        BNStrToNumstr(this.currentApproved, 18),
      )
    },
    handleClickAppend() {
      if (this.approvedEnough && !this.approvedEqual) this.restoreInputAmount()
      else if (this.canMaximizeAmount)
        this.inputAmount = removeTrailingZeros(
          BNStrToNumstr(this.dirBalance[0], 18),
        )
    },
    async handleClickAdd() {
      this.loading_add = true
      try {
        const addedNetwork = await this.provider?.provider.request?.(
          JSONRPC_BSC,
        )
        await this.updateChainId()
        console.log({ addedNetwork })
      } catch (error) {
        console.error(error)
      }
      this.loading_add = false
    },
    selectFromOnChangeHandler(data: any) {
      this.hashes = null
      if (data == this.ToToken) {
        this.direction = (this.direction[1] +
          this.direction[0]) as DirectionType
        this.ToToken = this.FromToken
        this.FromToken = data
      } else {
        switch (data) {
          case 'Ethereum (ERC-20)':
            this.direction = ('E' + this.direction[1]) as DirectionType
            this.FromToken = 'Ethereum (ERC-20)'
            break
          case 'Binance Smart Chain (BEP-20)':
            this.direction = ('B' + this.direction[1]) as DirectionType
            this.FromToken = 'Binance Smart Chain (BEP-20)'
            break
          case 'DBX Smart Network (DBX-20)':
            this.direction = ('X' + this.direction[1]) as DirectionType
            this.FromToken = 'DBX Smart Network (DBX-20)'
            break
        }
      }
    },
    selectToOnChangeHandler(data: any) {
      this.hashes = null
      if (data == this.FromToken) {
        this.direction = (this.direction[1] +
          this.direction[0]) as DirectionType
        this.FromToken = this.ToToken
        this.ToToken = data
      } else {
        switch (data) {
          case 'Ethereum (ERC-20)':
            this.direction = (this.direction[0] + 'E') as DirectionType
            this.ToToken = 'Ethereum (ERC-20)'
            break
          case 'Binance Smart Chain (BEP-20)':
            this.direction = (this.direction[0] + 'B') as DirectionType
            this.ToToken = 'Binance Smart Chain (BEP-20)'
            break
          case 'DBX Smart Network (DBX-20)':
            this.direction = (this.direction[0] + 'X') as DirectionType
            this.ToToken = 'DBX Smart Network (DBX-20)'
            break
        }
      }
    },
    async loadControllerInfo() {
      this.loading_controllerInfo = true
      try {
        this.controllerInfo = (
          await Axios.get('https://dbxbridge.uc.r.appspot.com/info')
        ).data
        if (!this.controllerInfo)
          throw new Error('Received invalid data from controller')
      } catch (error) {
        console.error(error)
      }
      this.loading_controllerInfo = false
    },
    async loadContractInfo() {
      this.loading_contractInfo = true
      try {
        const w = this.wallet
        const [Bb, Eb, Xb, BEa, BXa, EBa, EXa, Xa, Xd] = (
          await Promise.all([
            TKNB.balanceOf(w),
            TKNE.balanceOf(w),
            _providerX.getBalance(w),
            TKNB.allowance(w, address_BABE),
            TKNB.allowance(w, address_BABX),
            TKNE.allowance(w, address_BAEB),
            TKNE.allowance(w, address_BAEX),
            BAX.locked(w),
            BAX.directionE(w),
          ])
        ).map((r) => r.toString())
        this.approvedBE = BEa
        this.approvedBX = BXa
        this.approvedEB = EBa
        this.approvedEX = EXa
        this.approvedX = Xa
        this.approvedX_dirE = Xd !== 'false'
        this.balanceB = Bb
        this.balanceE = Eb
        this.balanceX = Xb
      } catch (error) {
        console.error(error)
      }
      this.loading_contractInfo = false
    },
    async handleClickRequest() {
      this.loading_swapping = true
      this.hashes = null
      this.hashes_url = {
        C: this.dirChainExplorer[0],
        D: this.dirChainExplorer[1],
      }
      this.hashes_names = {
        C: this.dirChainName[0],
        D: this.dirChainName[1],
      }
      try {
        this.warningMessage = ''
        if (
          !(this.approvedNonZero && this.approvedEqual) ||
          ((this.direction === 'XE' || this.direction === 'XB') &&
            this.approvedX_dirE !== (this.direction === 'XE'))
        ) {
          await this.approve()
          this.inBetween = true
        }
        this.inputAmount = ''
        await this.requestSwap()
      } catch (error) {
        this.warningMessage = error.message
        console.error(error)
      }
      this.inBetween = false
      this.loading_swapping = false
      if (this.paused_chainIdHandler) {
        await this.clickConnectMetamask()
        this.paused_chainIdHandler = false
      }
    },
    async approve() {
      this.loading_approve = true
      if (this.direction === 'XE' || this.direction === 'XB') {
        const ptx = await BAX.populateTransaction.writeEntry(
          this.direction === 'XE',
        )
        ptx.value = this.amountBN
        console.log({
          amt: this.amountBN.toString(),
          bal: this.dirBalance[0],
        })
        const tx = await this.signer!.sendTransaction(ptx)
        console.log({ tx })
        await _wait()
      } else {
        const TKN = new Contract(
          {
            EB: address_TKNE,
            BE: address_TKNB,
            EX: address_TKNE,
            BX: address_TKNB,
          }[this.direction],
          Token.abi,
          this.signer!,
        )
        console.log({
          amt: this.amountBN.toString(),
          bal: this.dirBalance[0],
        })
        const tx = await TKN.approve(
          {
            EB: address_BAEB,
            BE: address_BABE,
            EX: address_BAEX,
            BX: address_BABX,
          }[this.direction],
          this.amountBN,
        )
        console.log({ tx })
        const receipt = await tx.wait()
        console.log({ receipt })
      }
      await this.loadContractInfo()
      this.loading_approve = false
    },
    async requestSwap() {
      this.loading_request = true
      try {
        this.hashes = (
          await Axios.get(
            `https://dbxbridge.uc.r.appspot.com/process?direction=${this.direction}&address=${this.wallet}`,
          )
        ).data
        console.log(this.hashes)
      } catch (error) {
        console.error({ ...error })
        throw new Error(error.response.data)
      }
      await this.loadContractInfo()
      this.loading_request = false
    },
    // Frontend Functions
    stablehanler() {
      console.log('Go >>> Stable Token')
    },
  },
})
</script>

<style lang="css">
.two_buttons {
  display: flex;
  justify-content: center;
  padding: 10px;
}
.two_buttons span {
  margin: 10px;
}
</style>
