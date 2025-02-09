import { createContext, useContext } from 'react';
import CommonStore from './commonStore';

export default class RootStores {
    commonStore: CommonStore;
    constructor() {
        this.commonStore = new CommonStore(this);
    }
}

export const stores: RootStores = new RootStores();

export const StoreContext = createContext(stores);

export function useStore() {
    return useContext(StoreContext);
}
