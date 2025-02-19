import Animated, { FadeIn } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/ThemeProvider';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

const ListEmptyComponent = () => {
    const { t } = useTranslation();

    return (
        <Animated.View
            entering={FadeIn.duration(800).springify()}  // Smooth spring animation
            style={styles.emptyCommentsContainer}
        >
            <MaterialCommunityIcons name="comment-outline" size={50} color="#aaa" />
            <Text style={styles.noCommentsText}>{t('community.noCommentsYet')}</Text>
            <Text style={styles.noCommentsSubtitle}>{t('community.beTheFirstToComment')}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    emptyCommentsContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    noCommentsText: {
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
        color: '#aaa',
        marginTop: 5,
    },
    noCommentsSubtitle: {
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        color: '#bbb',
        marginTop: 2,
    },
});

export default ListEmptyComponent;
