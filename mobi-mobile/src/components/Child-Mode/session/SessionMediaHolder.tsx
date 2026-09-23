// MOBI/mobi-mobile/src/components/Child-Mode/session/SessionMediaHolder.tsx


import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio, Video, ResizeMode } from 'expo-av';

import { SessionMedia } from './SessionTypes';

type Props = {
  media?: SessionMedia[];
  fallbackImage?: any;
  imageSize?: {
    width: number | string;
    height: number;
  };
  mode?: 'large' | 'choice' | 'compact';
};

export default function SessionMediaHolder({
  media,
  fallbackImage,
}: Props) {
  const { width, height } = useWindowDimensions();

  const isLandscape = width > height;
  const isTablet = width >= 768;

  const imageWidth = isLandscape
    ? Math.min(width * 0.38, 390)
    : Math.min(width * 0.78, 360);

  const imageHeight = isLandscape
    ? Math.min(height * 0.3, 220)
    : isTablet
      ? 245
      : 200;

  const visibleMedia = media?.filter((item) => item.url);

  if (!visibleMedia || visibleMedia.length === 0) {
    return fallbackImage ? (
      <View style={styles.wrap}>
        <Image
          source={fallbackImage}
          style={[
            styles.image,
            {
              width: imageWidth,
              height: imageHeight,
            },
          ]}
        />
      </View>
    ) : null;
  }

  return (
    <View style={styles.wrap}>
	      {visibleMedia.map((item) =>
	        item.type === 'image' && item.url ? (
	          <Image
	            key={String(item.id ?? item.url)}
	            source={{ uri: item.url }}
            style={[
              styles.image,
              {
                width: imageWidth,
                height: imageHeight,
              },
            ]}
          />
	        ) : item.type === 'video' && item.url ? (
	          <Video
	            key={String(item.id ?? item.url)}
	            source={{ uri: item.url }}
            style={[
              styles.image,
              {
                width: imageWidth,
                height: imageHeight,
              },
            ]}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
          />
	        ) : item.type === 'audio' && item.url ? (
	          <AudioMaterial
	            key={String(item.id ?? item.url)}
	            url={item.url}
            name={item.name}
            width={imageWidth}
            height={imageHeight}
          />
        ) : (
	          <View
	            key={String(item.id ?? item.url)}
            style={[
              styles.placeholder,
              {
                width: imageWidth,
                height: imageHeight,
              },
            ]}
          >
            <Ionicons
              name={
                item.type === 'video'
                  ? 'videocam-outline'
                  : item.type === 'audio'
                    ? 'musical-notes-outline'
                    : 'document-outline'
              }
              size={42}
              color="#B48BC7"
            />

            <Text style={styles.placeholderTitle}>
              {item.type === 'video'
                ? 'Video Material'
                : item.type === 'audio'
                  ? 'Audio Material'
                  : 'File Material'}
            </Text>

            <Text style={styles.placeholderText}>
              {item.name || 'Media will be playable after backend integration.'}
            </Text>
          </View>
        ),
      )}
    </View>
  );
}

function AudioMaterial({
  url,
  name,
  width,
  height,
}: {
  url: string;
  name?: string;
  width: number;
  height: number;
}) {
  const [playing, setPlaying] = React.useState(false);
  const soundRef = React.useRef<Audio.Sound | null>(null);

  const toggleAudio = async () => {
    try {
      if (playing && soundRef.current) {
        await soundRef.current.pauseAsync();
        setPlaying(false);
        return;
      }

      if (!soundRef.current) {
        const { sound } = await Audio.Sound.createAsync({ uri: url });
        soundRef.current = sound;

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setPlaying(false);
          }
        });
      }

      await soundRef.current.playAsync();
      setPlaying(true);
    } catch (error) {
      console.log('Audio material playback error:', error);
      setPlaying(false);
    }
  };

  React.useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  return (
    <View
      style={[
        styles.placeholder,
        {
          width,
          height,
        },
      ]}
    >
      <Ionicons
        name={playing ? 'pause-circle' : 'play-circle'}
        size={56}
        color="#8759D6"
        onPress={toggleAudio}
      />

      <Text style={styles.placeholderTitle}>
        {playing ? 'Playing Audio' : 'Play Audio'}
      </Text>

      <Text style={styles.placeholderText}>
        {name || 'Audio material'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 18,
  },

  image: {
    borderRadius: 28,
    resizeMode: 'cover',
    backgroundColor: '#FFF',
  },

  placeholder: {
    borderRadius: 28,
    backgroundColor: '#FFF',

    borderWidth: 1.5,
    borderColor: '#E6C5E6',
    borderStyle: 'dashed',

    justifyContent: 'center',
    alignItems: 'center',

    paddingHorizontal: 18,
  },

  placeholderTitle: {
    marginTop: 8,

    fontSize: 14,
    fontWeight: '900',
    color: '#111',

    textAlign: 'center',
  },

  placeholderText: {
    marginTop: 4,

    fontSize: 11,
    color: '#777',

    textAlign: 'center',
    lineHeight: 15,
  },
});
