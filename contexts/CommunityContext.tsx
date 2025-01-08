// contexts/CommunityContext.tsx
import React, { createContext, useContext } from 'react';
import { useSharedValue } from 'react-native-reanimated';

const CommunityContext = createContext<{
    scrollY: any;
    searchIconClicked: any;
}>({
    scrollY: 0,
    searchIconClicked: false
});

export const CommunityProvider = ({ children }: { children: React.ReactNode }) => {
    const scrollY = useSharedValue(0);
    const searchIconClicked = useSharedValue(false);

    return (
        <CommunityContext.Provider value={{ scrollY, searchIconClicked }}>
            {children}
        </CommunityContext.Provider>
    );
};

export const useCommunity = () => useContext(CommunityContext);
