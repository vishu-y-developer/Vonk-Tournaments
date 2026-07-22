import { Wallet, Player } from '@/types';
import { WalletRepository } from '../interfaces/wallet-repository';
import { browserStorage } from '@/lib/storage/browser-storage';
import { STORAGE_KEYS } from '@/constants';

export class LocalWalletRepository implements WalletRepository {
  getWallet(playerId: string): Wallet | null {
    // Attempt to load direct wallet details
    const wallets = browserStorage.getItem<Record<string, Wallet>>(STORAGE_KEYS.WALLET, {});
    if (wallets && wallets[playerId]) {
      return wallets[playerId];
    }

    // Fallback to player profile balance if no wallet entry exists yet
    const player = browserStorage.getItem<Player | null>(STORAGE_KEYS.USER, null);
    const balance = (player && player.id === playerId) ? player.walletBalance : 0;

    const initialWallet: Wallet = {
      playerId,
      balance,
      totalAdded: balance > 0 ? balance : 0,
      totalFeesPaid: 0,
      totalPrizesWon: 0,
      totalRefunds: 0,
      totalBonuses: 0,
      updatedAt: new Date().toISOString(),
    };

    // Save initial wallet
    wallets[playerId] = initialWallet;
    browserStorage.setItem(STORAGE_KEYS.WALLET, wallets);
    return initialWallet;
  }

  saveWallet(wallet: Wallet): void {
    const wallets = browserStorage.getItem<Record<string, Wallet>>(STORAGE_KEYS.WALLET, {});
    wallets[wallet.playerId] = wallet;
    browserStorage.setItem(STORAGE_KEYS.WALLET, wallets);

    // Sync back to player profile walletBalance field to prevent mismatch in older headers
    const player = browserStorage.getItem<Player | null>(STORAGE_KEYS.USER, null);
    if (player && player.id === wallet.playerId) {
      player.walletBalance = wallet.balance;
      browserStorage.setItem(STORAGE_KEYS.USER, player);
    }
  }

  resetWallet(playerId: string): void {
    const wallets = browserStorage.getItem<Record<string, Wallet>>(STORAGE_KEYS.WALLET, {});
    delete wallets[playerId];
    browserStorage.setItem(STORAGE_KEYS.WALLET, wallets);

    const player = browserStorage.getItem<Player | null>(STORAGE_KEYS.USER, null);
    if (player && player.id === playerId) {
      player.walletBalance = 0;
      browserStorage.setItem(STORAGE_KEYS.USER, player);
    }
  }
}

export const localWalletRepository = new LocalWalletRepository();
export default localWalletRepository;
