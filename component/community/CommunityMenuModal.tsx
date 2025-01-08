import React, { forwardRef, useImperativeHandle, useState } from 'react';
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

export interface BottomSheetModalRef {
    slideIn: () => void;
    slideOut: () => void;
}

const BottomSheetModal = forwardRef<BottomSheetModalRef>((props, ref) => {
    const { theme } = useTheme();

    const [modalVisible, setModalVisible] = useState(false);
    const slideAnim = useSharedValue(Dimensions.get('window').height);

    useImperativeHandle(ref, () => ({
        slideIn,
        slideOut
    }));

    // Slide in animation
    const slideIn = () => {
        setModalVisible(true);
        slideAnim.value = withTiming(0, { duration: 300 });
    };

    // Slide out animation
    const slideOut = () => {
        slideAnim.value = withTiming(Dimensions.get('window').height, { duration: 300 }, () => {
            runOnJS(setModalVisible)(false);
        });
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
                    <Text style={[styles.title, { color: theme.colors.text }]}>MENU</Text>
                    <TouchableOpacity style={styles.closeButton} onPress={slideOut}>
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                </View>

                
                {/* Payment Options */}
                <TouchableOpacity style={[styles.cardOption]}>
                    <View style={styles.cardInfo}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.cardName, { color: theme.colors.text }]}>Manage Communities</Text>
                            <Text style={styles.cardDesc}>Manage your farming communities. Join existing communities, and connect with other farmers. Share knowledge, experiences and best practices with fellow community members.</Text>
                        </View>
                    <Feather name="chevron-right" size={24} color={theme.colors.primary} />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.cardOption]}>
                    <View style={styles.cardInfo}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.cardName, { color: theme.colors.text }]}>My Posts</Text>
                            <Text style={styles.cardDesc}>View and manage your community posts. edit content, and see how your posts are helping other farmers. Share your agricultural journey and insights with the community.</Text>
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
    cardIconVisa: {
        width: 40,
        height: 25,
        backgroundColor: '#1a73e8',
        marginRight: 10,
        borderRadius: 5,
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