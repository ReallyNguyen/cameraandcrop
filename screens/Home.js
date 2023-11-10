import { StyleSheet, Text, View, Button } from 'react-native';
import React, { useState, useRef } from 'react';
import { Camera } from 'expo-camera';
import { ImageManipulator } from 'expo-image-crop';
import axios from 'axios';

async function ocrSpace(input, options = {}) {
    try {
        if (!input || typeof input !== 'string') {
            throw Error('Param input is required and must be of type string');
        }

        const {
            apiKey,
            ocrUrl,
            language,
            isOverlayRequired,
            filetype,
            detectOrientation,
            isCreateSearchablePdf,
            isSearchablePdfHideTextLayer,
            scale,
            isTable,
            OCREngine,
        } = options;

        const formData = new FormData();
        formData.append('base64Image', `data:image/png;base64,${input}`);
        formData.append('language', String(language || 'eng'));
        formData.append('isOverlayRequired', String(isOverlayRequired || 'false'));
        if (filetype) {
        formData.append('filetype', String(filetype));
        }
        formData.append('detectOrientation', String(detectOrientation || 'false'));
        formData.append('isCreateSearchablePdf', String(isCreateSearchablePdf || 'false'));
        formData.append('isSearchablePdfHideTextLayer', String(isSearchablePdfHideTextLayer || 'false'));
        formData.append('scale', String(scale || 'false'));
        formData.append('isTable', String(isTable || 'false'));
        formData.append('OCREngine', String(OCREngine || '1'));

        const response = await axios.post(ocrUrl, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'apikey': apiKey,
            },
        });

        return response.data;
    } 
    catch (error) {
        console.error(error);
    }
}

export default function Home({ navigation }) {
    const [isVisible, setIsVisible] = useState(false);
    const [uri, setURI] = useState(null);
    const [ocrResponse, setOcrResponse] = useState(null);
    const [croppedImage, setCroppedImage] = useState(null);
    const cameraRef = useRef();

    const takePicture = async () => {
        if (cameraRef.current) {
            const photo = await cameraRef.current.takePictureAsync();
            setURI(photo.uri);
            setIsVisible(true);
        }
    };

    const handleOCR = async (base64) => {
        try {
            if (!base64) {
                throw new Error('base64 is missing or invalid');
            }

            const options = {
                apiKey: 'K86472302488957',
                ocrUrl: 'https://api.ocr.space/parse/image',
            };

            const response = await ocrSpace(base64, options);
            console.log(response);
            setOcrResponse(response.ParsedResults[0].ParsedText.replace(/(\r\n|\n|\r)/gm, ""));

        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            {isVisible ? (
                <ImageManipulator
                    photo={{ uri }}
                    saveOptions={{ base64: true }}
                    isVisible={isVisible}
                    onPictureChoosed={async ({ uri: uriM, base64 }) => {
                        setURI(uriM);
                        setIsVisible(false);
                        setCroppedImage(base64);
                        await handleOCR(base64);
                    }}
                    onToggleModal={() => setIsVisible(!isVisible)}
                />
            ) : (
                <Camera
                    style={{ flex: 1 }}
                    type={Camera.Constants.Type.back}
                    ref={cameraRef}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'flex-end',
                            marginBottom: 20,
                        }}
                    >
                        <Button title="Capture" onPress={takePicture} />
                    </View>
                </Camera>
            )}

            {ocrResponse && <Text>{JSON.stringify(ocrResponse)}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});