import React, { useState, useEffect, useRef } from 'react';
import { Dimensions, Text, View, Button, TouchableOpacity, Image, ImageBackground, StyleSheet } from 'react-native';
import { ImageManipulator } from 'expo-image-crop';
import { Camera } from 'expo-camera';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { manipulateAsync, FlipType, SaveFormat } from 'expo-image-manipulator';

export default function App({ navigation }) {
    const [isVisible, setIsVisible] = useState(false);
    const [uri, setURI] = useState(null); // Set to null initially
    const [pre, setPre] = useState(null);

    const { width, height } = Dimensions.get('window');
    const cameraRef = useRef();
    const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [imageUri, setImageUri] = useState(null);

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestPermissionsAsync();
            if (status === 'granted') {
                setURI(uri);
            }
        })();
    }, []);


    const flipCamera = () => {
        setCameraType(
            cameraType === Camera.Constants.Type.back
                ? Camera.Constants.Type.front
                : Camera.Constants.Type.back
        );
    };

    const takePicture = async (navigation) => {
        if (cameraRef.current && isCameraReady) {
            try {
                const { uri, width, height } = await cameraRef.current.takePictureAsync();
                console.log('Picture taken:', uri);

                setImageUri(uri);
                navigation.navigate('Picture', { imageUri: uri, width, height });
            } catch (error) {
                console.error('Error taking picture:', error);
            }
        }
    };

    return (
        <ImageBackground
            resizeMode="contain"
            style={{
                justifyContent: 'center', padding: 20, alignItems: 'center', height, width, backgroundColor: 'black',
            }}
            source={{ uri }}
        >
            <Camera
                style={{ flex: 1 }}
                type={cameraType}
                onCameraReady={() => setIsCameraReady(true)}
                ref={cameraRef}
            >

                <View
                    style={{
                        backgroundColor: 'transparent',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        gap: 100,
                        marginTop: 600,
                    }}
                >
                    <TouchableOpacity
                        style={{
                            margin: 0
                        }}
                        onPress={flipCamera}
                    >
                        <Text style={{ fontSize: 18, color: 'white' }}>
                            Flip
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{
                            margin: 0,
                        }}
                        onPress={() => takePicture(navigation)}
                    >
                        <Text style={{ fontSize: 18, color: 'white' }}>
                            Capture
                        </Text>
                    </TouchableOpacity>
                </View>
            </Camera>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Button title="Flip Camera" onPress={flipCamera} />
                <Button title="Take Picture" onPress={() => takePicture(navigation)} />
            </View>

            <ImageManipulator
                photo={{ uri }}
                isVisible={isVisible}
                onPictureChoosed={({ uri: uriM }) => setPre(uriM)}
                onToggleModal={() => setIsVisible(!isVisible)}
            />
            {pre && <Image source={{ uri: pre }} style={{ width: 200, height: 200, resizeMode: "contain" }} />}
        </ImageBackground>
    );
}
