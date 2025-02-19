import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import {
    Modal,
    Text,
    StyleSheet,
    Dimensions,
    Pressable,
    View,
    TouchableOpacity
} from 'react-native';

import Animated, { 
    useSharedValue, 
    withTiming, 
    runOnJS,
    useAnimatedStyle
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/ThemeProvider';
import { Feather } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useTranslation } from 'react-i18next';

export interface BottomSheetModalRef {
    slideIn: () => void;
    slideOut: () => void;
}

const BottomSheetModal = forwardRef<BottomSheetModalRef>((props, ref) => {
    const { theme } = useTheme();

    const { t } = useTranslation();

    const [modalVisible, setModalVisible] = useState(false);
    const slideAnim = useSharedValue(Dimensions.get('window').height);
    const router = useRouter();
    const pathname = usePathname();  // Get the current route

    useImperativeHandle(ref, () => ({
        slideIn,
        slideOut
    }));

    // Close modal when navigating to another page
    useEffect(() => {
        if (modalVisible) {
            slideOut();
        }
    }, [pathname]);  // Runs when the route changes

    // Slide in animation
    const slideIn = () => {
        slideAnim.value = Dimensions.get('window').height;  // Reset position before opening
        setModalVisible(true);
        slideAnim.value = withTiming(0, { duration: 300 });
    };

    // Slide out animation
    const slideOut = () => {
        slideAnim.value = withTiming(Dimensions.get('window').height, { duration: 300 }, () => {
            runOnJS(setModalVisible)(false);
        });
    };

    // Handle navigation safely
    const handleNavigation = (route: any) => {
        slideOut();
        setTimeout(() => {
            router.push(route);
        }, 300);  // Ensure modal is closed before navigating
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: slideAnim.value }],
    }));

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={modalVisible}
            onRequestClose={slideOut}
        >
            <Pressable style={styles.modalOverlay} onPress={slideOut} />
            
            <Animated.View
                style={[
                    styles.modalContent,
                    animatedStyle, 
                    { backgroundColor: theme.colors.background }
                ]}
            >

                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.colors.text }]}>{t('community.menu')}</Text>
                    <TouchableOpacity style={styles.closeButton} onPress={slideOut}>
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                </View>

                
                {/* Manage Communities */}
                <TouchableOpacity style={[styles.cardOption]} onPress={() => handleNavigation('/(authenticated)/(tabs)/community/list')}>
                    <View style={styles.cardInfo}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.cardName, { color: theme.colors.text }]}>{t('community.manageCommunities')}</Text>
                            <Text style={styles.cardDesc}>{t('community.manageCommunitiesContent')}</Text>
                        </View>
                        <Feather name="chevron-right" size={24} color={theme.colors.primary} />
                    </View>
                </TouchableOpacity>

                {/* My Posts */}
                <TouchableOpacity style={[styles.cardOption]} onPress={() => handleNavigation('/(authenticated)/(tabs)/community/post')}>
                    <View style={styles.cardInfo}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.cardName, { color: theme.colors.text }]}>{t('community.myPosts')}</Text>
                            <Text style={styles.cardDesc}>{t('community.myPostsContent')}</Text>
                        </View>
                        <Feather name="chevron-right" size={24} color={theme.colors.primary} />
                    </View>
                </TouchableOpacity>

            </Animated.View>
        </Modal>
    );
});

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
        alignSelf: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
    closeButton: {
        backgroundColor: '#f5f5f5',
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    closeButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    cardOption: {
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: 'gray',
        marginBottom: 10,
        width: '100%'
    },
    cardInfo: {
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%'
    },
    cardName: {
        fontSize: 16,
        fontWeight: '500',
    },
    cardDesc: {
        fontSize: 14,
        color: '#777', 
    },
});

export default BottomSheetModal;
