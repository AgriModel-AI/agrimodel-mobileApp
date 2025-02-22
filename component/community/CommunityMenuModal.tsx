import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import {
    Modal,
    Text,
    StyleSheet,
    Dimensions,
    Pressable,
    View,
    TouchableOpacity,
    Platform,
    StyleProp,
    ViewStyle,
    TextStyle
} from 'react-native';

import Animated, { 
    useSharedValue, 
    withTiming, 
    runOnJS,
    useAnimatedStyle,
    withSpring,
    WithSpringConfig,
    useAnimatedGestureHandler
} from 'react-native-reanimated';
import {
    GestureDetector,
    Gesture,
    PanGestureHandler
} from 'react-native-gesture-handler';
import { useTheme } from '@/hooks/ThemeProvider';
import { Feather } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useTranslation } from 'react-i18next';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const THRESHOLD = SCREEN_HEIGHT * 0.2;

export interface BottomSheetModalRef {
    slideIn: () => void;
    slideOut: () => void;
}
interface MenuOption {
    title: string;
    description: string;
    route: string;
}

interface ThemeColors {
    background: string;
    text: string;
    card: string;
    primary: string;
}

interface Theme {
    colors: ThemeColors;
    dark: boolean;
}

interface StylesProps {
    overlay: ViewStyle;
    overlayPressable: ViewStyle;
    modalContent: ViewStyle;
    handle: ViewStyle;
    header: ViewStyle;
    title: TextStyle;
    closeButton: ViewStyle;
    option: ViewStyle;
    optionContent: ViewStyle;
    optionTextContainer: ViewStyle;
    optionTitle: TextStyle;
    optionDescription: TextStyle;
    iconContainer: ViewStyle;
}
const BottomSheetModal = forwardRef<BottomSheetModalRef>((_, ref) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const translateY = useSharedValue<number>(SCREEN_HEIGHT);
    const overlayOpacity = useSharedValue<number>(0);
    const router = useRouter();
    const pathname = usePathname();
    const context = useSharedValue({ y: 0 });

    const springConfig: WithSpringConfig = {
        damping: 20,
        stiffness: 90,
        mass: 0.5
    };

    useImperativeHandle(ref, () => ({
        slideIn,
        slideOut
    }));

    useEffect(() => {
        if (modalVisible) {
            slideOut();
        }
    }, [pathname]);

    const slideIn = (): void => {
        setModalVisible(true);
        overlayOpacity.value = withTiming(1, { duration: 200 });
        translateY.value = withSpring(0, springConfig);
    };

    const slideOut = (): void => {
        overlayOpacity.value = withTiming(0, { duration: 200 });
        translateY.value = withSpring(
            SCREEN_HEIGHT,
            springConfig,
            () => {
                runOnJS(setModalVisible)(false);
            }
        );
    };

    const gesture = Gesture.Pan()
        .onStart(() => {
            context.value = { y: translateY.value };
        })
        .onUpdate((event) => {
            translateY.value = Math.max(0, context.value.y + event.translationY);
            overlayOpacity.value = withTiming(
                Math.max(0, Math.min(1, 1 - translateY.value / SCREEN_HEIGHT * 2))
            );
        })
        .onEnd((event) => {
            if (event.velocityY > 500 || translateY.value > THRESHOLD) {
                runOnJS(slideOut)();
            } else {
                translateY.value = withSpring(0, springConfig);
                overlayOpacity.value = withTiming(1);
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const overlayStyle = useAnimatedStyle(() => ({
        opacity: overlayOpacity.value,
    }));

    const renderOption = ({ title, description, route }: MenuOption): JSX.Element => (
        <TouchableOpacity
            key={route}
            style={[styles.option, { backgroundColor: theme.colors.inputBackground }]}
            onPress={() => handleNavigation(route)}
            activeOpacity={0.7}
        >
            <View style={styles.optionContent}>
                <View style={styles.optionTextContainer}>
                    <Text style={[styles.optionTitle, { color: theme.colors.text }]}>
                        {title}
                    </Text>
                    <Text 
                        style={[
                            styles.optionDescription, 
                            { color: `${theme.colors.text}80` }
                        ]}
                    >
                        {description}
                    </Text>
                </View>
                <View 
                    style={[
                        styles.iconContainer, 
                        { backgroundColor: `${theme.colors.primaryTransparent}` }
                    ]}
                >
                    <Feather name="chevron-right" size={20} color={theme.colors.primary} />
                </View>
            </View>
        </TouchableOpacity>
    );

    const menuOptions: MenuOption[] = [
        {
            title: t('community.manageCommunities'),
            description: t('community.manageCommunitiesContent'),
            route: '/(authenticated)/(tabs)/community/list'
        },
        {
            title: t('community.myPosts'),
            description: t('community.myPostsContent'),
            route: '/(authenticated)/(tabs)/community/post'
        }
    ];


    const handleNavigation = (route: any): void => {
        slideOut();
        setTimeout(() => {
            router.push(route);
        }, 300);
    };

    // ... (keep your existing renderOption and menuOptions)

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={modalVisible}
            onRequestClose={slideOut}
        >
            <Animated.View style={[styles.overlay, overlayStyle]}>
                <Pressable style={styles.overlayPressable} onPress={slideOut} />
            </Animated.View>
            
            <GestureDetector gesture={gesture}>
                <Animated.View
                    style={[
                        styles.modalContent,
                        animatedStyle, 
                        { backgroundColor: theme.colors.background }
                    ]}
                >
                    <View style={styles.handleContainer}>
                        <View style={[
                            styles.handle,
                            { backgroundColor: theme.colors.text + '40' }
                        ]} />
                    </View>
                    
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.colors.text }]}>
                            {t('community.menu')}
                        </Text>
                        <TouchableOpacity 
                            style={[
                                styles.closeButton, 
                                { backgroundColor: theme.colors.inputBackground }
                            ]} 
                            onPress={slideOut}
                        >
                            <Feather name="x" size={20} color={theme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    {menuOptions.map(renderOption)}
                </Animated.View>
            </GestureDetector>
        </Modal>
    );
});

const styles = StyleSheet.create({
    // ... (keep your existing styles)
    handleContainer: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
    },
    modalContent: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 20,
    },overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    overlayPressable: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    option: {
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
    },
    optionContent: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    optionTextContainer: {
        flex: 1,
        marginRight: 12,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    optionDescription: {
        fontSize: 14,
        lineHeight: 20,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },

});

export default BottomSheetModal;