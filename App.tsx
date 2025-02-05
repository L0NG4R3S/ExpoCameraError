import {CameraView, CameraType, useCameraPermissions} from 'expo-camera';
import {useState} from 'react';
import {Button, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import {runOnJS, useSharedValue} from 'react-native-reanimated';

const MIN_ZOOM = 0;
const MAX_ZOOM = 0.5;

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const [zoom, setZoom] = useState(0);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const pinchGesture = Gesture.Pinch()
    .onUpdate(e => {
      const newValue = savedScale.value * e.scale;
      const zoomValue = newValue * 0.1;
      console.log('on pinch', zoomValue);
      if (zoomValue <= MIN_ZOOM) {
        runOnJS(setZoom)(0);
        return;
      } else if (zoomValue > MAX_ZOOM) {
        savedScale.value = scale.value;
        return;
      } else {
        scale.value = newValue;
        runOnJS(setZoom)(zoomValue);
      }
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <View style={styles.container}>
        <GestureDetector gesture={pinchGesture}>
          <CameraView style={styles.camera} facing={facing} zoom={zoom}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={toggleCameraFacing}>
                <Text style={styles.text}>Flip Camera</Text>
              </TouchableOpacity>
            </View>
          </CameraView>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
